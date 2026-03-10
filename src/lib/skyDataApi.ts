import { supabase } from "@/integrations/supabase/client";

export interface SkySummary {
  date: string;
  totalObservations: number;
  uniqueObjects: number;
  topObjects: { name: string; type: string; observations: number; avgConfidence: number }[];
  regionCount: number;
}

export interface TrendingData {
  period: string;
  trending: { objectId: string; name: string; type: string; totalObservations: number; avgConfidence: number }[];
}

export interface SkyAlert {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  region: string | null;
  object_id: string | null;
  object_name: string | null;
  observation_count: number;
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface RegionData {
  date: string;
  regions: { key: string; lat: number; lon: number; observations: number }[];
}

async function callSkyDataApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const { data, error } = await supabase.functions.invoke("sky-data-api", {
    body: null,
    method: "GET",
    headers: {},
  });

  // Fallback: use direct query for client-side access
  if (error) {
    console.warn("Edge function unavailable, using direct query fallback");
    return await directQuery<T>(endpoint, params);
  }

  return data as T;
}

async function directQuery<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const date = params?.date || new Date().toISOString().split("T")[0];
  const limit = Math.min(parseInt(params?.limit || "50"), 100);

  switch (endpoint) {
    case "summary": {
      const { data } = await supabase
        .from("sky_observations_aggregate")
        .select("*")
        .eq("observation_date", date)
        .order("observation_count", { ascending: false })
        .limit(limit);

      const totalObservations = data?.reduce((s, a) => s + a.observation_count, 0) || 0;
      return {
        date,
        totalObservations,
        uniqueObjects: new Set(data?.map(a => a.object_id)).size,
        topObjects: data?.slice(0, 10).map(a => ({
          name: a.object_name,
          type: a.object_type,
          observations: a.observation_count,
          avgConfidence: Math.round(a.avg_confidence || 0),
        })) || [],
        regionCount: new Set(data?.map(a => a.region_key)).size,
      } as T;
    }

    case "trending": {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      const { data } = await supabase
        .from("sky_observations_aggregate")
        .select("object_id, object_name, object_type, observation_count, avg_confidence")
        .gte("observation_date", weekAgo)
        .order("observation_count", { ascending: false })
        .limit(limit);

      const grouped: Record<string, { name: string; type: string; total: number; conf: number; cnt: number }> = {};
      for (const r of data || []) {
        if (!grouped[r.object_id]) grouped[r.object_id] = { name: r.object_name, type: r.object_type, total: 0, conf: 0, cnt: 0 };
        grouped[r.object_id].total += r.observation_count;
        grouped[r.object_id].conf += (r.avg_confidence || 0) * r.observation_count;
        grouped[r.object_id].cnt += r.observation_count;
      }

      return {
        period: "7d",
        trending: Object.entries(grouped)
          .map(([id, g]) => ({ objectId: id, name: g.name, type: g.type, totalObservations: g.total, avgConfidence: Math.round(g.conf / (g.cnt || 1)) }))
          .sort((a, b) => b.totalObservations - a.totalObservations)
          .slice(0, 20),
      } as T;
    }

    case "alerts": {
      const { data } = await supabase
        .from("sky_alerts")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      return { alerts: data || [] } as T;
    }

    case "regions": {
      const { data } = await supabase
        .from("sky_observations_aggregate")
        .select("region_key, latitude_bucket, longitude_bucket, observation_count")
        .eq("observation_date", date)
        .order("observation_count", { ascending: false })
        .limit(limit);
      return {
        date,
        regions: data?.map(r => ({ key: r.region_key, lat: r.latitude_bucket, lon: r.longitude_bucket, observations: r.observation_count })) || [],
      } as T;
    }

    default:
      return {} as T;
  }
}

export const getSkyDataSummary = (date?: string) =>
  callSkyDataApi<SkySummary>("summary", date ? { date } : undefined);

export const getTrendingObjects = () =>
  callSkyDataApi<TrendingData>("trending");

export const getSkyAlerts = () =>
  callSkyDataApi<{ alerts: SkyAlert[] }>("alerts");

export const getRegionData = (date?: string) =>
  callSkyDataApi<RegionData>("regions", date ? { date } : undefined);
