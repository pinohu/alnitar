/**
 * Alnitar API client (SDK) — type-safe access to public API v1 for researchers and integrations.
 * Use with API key from admin. Rate limit: 100 requests per minute per key.
 */

export interface AlnitarApiConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ObservationRow {
  id: string;
  constellation_id: string;
  constellation_name: string;
  date: string;
  location: string | null;
  created_at: string;
}

export interface AggregateRow {
  day?: string;
  constellation_id?: string;
  constellation_name?: string;
  count: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: string;
  importance: string;
  relatedObjects: string[];
}

function headers(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export interface GetObservationsParams {
  limit?: number;
  offset?: number;
  date_from?: string;
  date_to?: string;
  constellation_id?: string;
}

export interface GetAggregatesParams {
  by?: "day" | "constellation";
}

export interface GetUpcomingEventsParams {
  days?: number;
}

export function createAlnitarApiClient(config: AlnitarApiConfig) {
  const { baseUrl, apiKey } = config;
  const base = baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${base}/${path}`, {
      ...options,
      headers: { ...headers(apiKey), ...(options?.headers as Record<string, string>) },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Alnitar API ${res.status}: ${body || res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  return {
    /** Paginated observations (API key required, rate limited). */
    async getObservations(params: GetObservationsParams = {}): Promise<{ data: ObservationRow[] }> {
      const q = new URLSearchParams();
      if (params.limit != null) q.set("limit", String(params.limit));
      if (params.offset != null) q.set("offset", String(params.offset));
      if (params.date_from) q.set("date_from", params.date_from);
      if (params.date_to) q.set("date_to", params.date_to);
      if (params.constellation_id) q.set("constellation_id", params.constellation_id);
      return request<{ data: ObservationRow[] }>(`api/v1/observations?${q.toString()}`);
    },

    /** Aggregated counts by day or constellation (API key required, rate limited). */
    async getAggregates(params: GetAggregatesParams = {}): Promise<{ data: AggregateRow[] }> {
      const by = params.by ?? "day";
      return request<{ data: AggregateRow[] }>(`api/v1/aggregates?by=${encodeURIComponent(by)}`);
    },

    /** Upcoming celestial events (no API key required). */
    async getUpcomingEvents(params: GetUpcomingEventsParams = {}): Promise<{ data: UpcomingEvent[] }> {
      const days = params.days ?? 30;
      return request<{ data: UpcomingEvent[] }>(`api/events/upcoming?days=${days}`);
    },
  };
}

export type AlnitarApiClient = ReturnType<typeof createAlnitarApiClient>;
