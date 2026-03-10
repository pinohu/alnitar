import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "summary";
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

    let responseData: unknown;

    switch (endpoint) {
      case "summary": {
        // Global observation summary for a date
        const { data: aggregates } = await supabase
          .from("sky_observations_aggregate")
          .select("*")
          .eq("observation_date", date)
          .order("observation_count", { ascending: false })
          .limit(limit);

        const totalObservations = aggregates?.reduce((sum, a) => sum + a.observation_count, 0) || 0;
        const uniqueObjects = new Set(aggregates?.map(a => a.object_id)).size;
        const topObjects = aggregates?.slice(0, 10).map(a => ({
          name: a.object_name,
          type: a.object_type,
          observations: a.observation_count,
          avgConfidence: Math.round(a.avg_confidence),
        })) || [];

        responseData = {
          date,
          totalObservations,
          uniqueObjects,
          topObjects,
          regionCount: new Set(aggregates?.map(a => a.region_key)).size,
        };
        break;
      }

      case "trending": {
        // Most observed objects in last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const { data: trending } = await supabase
          .from("sky_observations_aggregate")
          .select("object_id, object_name, object_type, observation_count, avg_confidence")
          .gte("observation_date", weekAgo)
          .order("observation_count", { ascending: false })
          .limit(limit);

        // Group by object
        const grouped: Record<string, { name: string; type: string; total: number; avgConf: number; count: number }> = {};
        for (const row of trending || []) {
          if (!grouped[row.object_id]) {
            grouped[row.object_id] = { name: row.object_name, type: row.object_type, total: 0, avgConf: 0, count: 0 };
          }
          grouped[row.object_id].total += row.observation_count;
          grouped[row.object_id].avgConf += row.avg_confidence * row.observation_count;
          grouped[row.object_id].count += row.observation_count;
        }

        responseData = {
          period: "7d",
          trending: Object.entries(grouped)
            .map(([id, g]) => ({
              objectId: id,
              name: g.name,
              type: g.type,
              totalObservations: g.total,
              avgConfidence: Math.round(g.avgConf / (g.count || 1)),
            }))
            .sort((a, b) => b.totalObservations - a.totalObservations)
            .slice(0, 20),
        };
        break;
      }

      case "alerts": {
        const { data: alerts } = await supabase
          .from("sky_alerts")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(limit);

        responseData = { alerts: alerts || [] };
        break;
      }

      case "regions": {
        // Regional observation density
        const { data: regions } = await supabase
          .from("sky_observations_aggregate")
          .select("region_key, latitude_bucket, longitude_bucket, observation_count")
          .eq("observation_date", date)
          .order("observation_count", { ascending: false })
          .limit(limit);

        responseData = {
          date,
          regions: regions?.map(r => ({
            key: r.region_key,
            lat: r.latitude_bucket,
            lon: r.longitude_bucket,
            observations: r.observation_count,
          })) || [],
        };
        break;
      }

      default:
        responseData = {
          error: "Unknown endpoint",
          available: ["summary", "trending", "alerts", "regions"],
        };
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
