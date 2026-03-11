/**
 * Database Abstraction Layer
 *
 * Provides a portable interface for data access.
 * When VITE_CF_API_URL is set, uses Cloudflare Worker (D1) for observations.
 * Otherwise uses Supabase (via Lovable Cloud).
 */

import { supabase } from "@/integrations/supabase/client";
import { cfFetch, isCloudflareConfigured } from "@/integrations/cloudflare/client";

// ─── Generic Types ───────────────────────────────────────────

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface QueryResult<T> {
  data: T[];
  count?: number;
  error?: string;
}

export interface SingleResult<T> {
  data: T | null;
  error?: string;
}

// ─── Database Adapter Interface ──────────────────────────────

export interface DatabaseAdapter {
  // Generic CRUD
  query<T>(table: string, options?: { filters?: Record<string, unknown>; orderBy?: string; ascending?: boolean; limit?: number; offset?: number }): Promise<QueryResult<T>>;
  getById<T>(table: string, id: string): Promise<SingleResult<T>>;
  insert<T>(table: string, data: Partial<T>): Promise<SingleResult<T>>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<SingleResult<T>>;
  remove(table: string, id: string): Promise<{ error?: string }>;
}

// ─── Supabase Adapter ────────────────────────────────────────

class SupabaseAdapter implements DatabaseAdapter {
  // Dynamic table name: Supabase client types don't support string table names
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async query<T>(table: string, options?: { filters?: Record<string, unknown>; orderBy?: string; ascending?: boolean; limit?: number; offset?: number }): Promise<QueryResult<T>> {
    let q = (supabase.from as any)(table).select("*", { count: "exact" });

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        q = q.eq(key, value);
      }
    }
    if (options?.orderBy) {
      q = q.order(options.orderBy, { ascending: options.ascending ?? false });
    }
    if (options?.limit) q = q.limit(options.limit);
    if (options?.offset) q = q.range(options.offset, options.offset + (options.limit || 50) - 1);

    const { data, error, count } = await q;
    return { data: (data as T[]) || [], count: count ?? undefined, error: error?.message };
  }

  async getById<T>(table: string, id: string): Promise<SingleResult<T>> {
    const { data, error } = await (supabase.from as any)(table).select("*").eq("id", id).maybeSingle();
    return { data: data as T | null, error: error?.message };
  }

  async insert<T>(table: string, data: Partial<T>): Promise<SingleResult<T>> {
    const { data: result, error } = await (supabase.from as any)(table).insert(data).select().single();
    return { data: result as T | null, error: error?.message };
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<SingleResult<T>> {
    const { data: result, error } = await (supabase.from as any)(table).update(data).eq("id", id).select().single();
    return { data: result as T | null, error: error?.message };
  }

  async remove(table: string, id: string): Promise<{ error?: string }> {
    const { error } = await (supabase.from as any)(table).delete().eq("id", id);
    return { error: error?.message };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

// ─── Cloudflare (D1) Adapter ───────────────────────────────────
// Uses Worker GET/POST/PATCH/DELETE for observations when VITE_CF_API_URL is set.

class CloudflareAdapter implements DatabaseAdapter {
  async query<T>(
    table: string,
    options?: {
      filters?: Record<string, unknown>;
      orderBy?: string;
      ascending?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<QueryResult<T>> {
    if (table !== "observations") return { data: [], error: "Cloudflare adapter supports only observations table" };
    const userId = options?.filters?.user_id as string | undefined;
    if (!userId) return { data: [], error: "user_id filter required for observations" };
    const limit = options?.limit ?? 100;
    try {
      const res = await cfFetch(`api/observations?user_id=${encodeURIComponent(userId)}&limit=${limit}`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return { data: [], error: (errBody as { error?: string }).error ?? res.statusText };
      }
      const body = (await res.json()) as { data?: T[] };
      let data = (body.data ?? []) as T[];
      if (options?.orderBy) {
        const asc = options.ascending ?? false;
        data = [...data].sort((a, b) => {
          const av = (a as Record<string, unknown>)[options.orderBy!];
          const bv = (b as Record<string, unknown>)[options.orderBy!];
          if (av == null && bv == null) return 0;
          if (av == null) return asc ? 1 : -1;
          if (bv == null) return asc ? -1 : 1;
          const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
          return asc ? cmp : -cmp;
        });
      }
      if (options?.offset) data = data.slice(options.offset, options.offset + (options.limit ?? data.length));
      return { data };
    } catch (e) {
      return { data: [], error: e instanceof Error ? e.message : "Request failed" };
    }
  }

  async getById<T>(table: string, id: string): Promise<SingleResult<T>> {
    if (table !== "observations") return { data: null, error: "Cloudflare adapter supports only observations table" };
    try {
      const res = await cfFetch(`api/observations/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) return { data: null };
        const errBody = await res.json().catch(() => ({}));
        return { data: null, error: (errBody as { error?: string }).error ?? res.statusText };
      }
      const body = (await res.json()) as { data?: T };
      return { data: body.data ?? null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "Request failed" };
    }
  }

  async insert<T>(table: string, data: Partial<T>): Promise<SingleResult<T>> {
    if (table !== "observations") return { data: null, error: "Cloudflare adapter supports only observations table" };
    const row = data as Record<string, unknown>;
    const payload = {
      constellation_id: row.constellation_id ?? "",
      constellation_name: row.constellation_name ?? "",
      confidence: row.confidence ?? 0,
      notes: row.notes ?? "",
      location: row.location ?? "",
      date: row.date ?? new Date().toISOString().slice(0, 10),
      equipment: row.equipment ?? "phone",
      image_url: row.image_url ?? null,
      device_type: row.device_type ?? "phone",
      alternate_matches: row.alternate_matches ?? [],
      verified_at: row.verified_at ?? null,
      verification_payload: row.verification_payload ?? null,
      visibility: (row.visibility as string) ?? "private",
    };
    try {
      const res = await cfFetch("api/observations", { method: "POST", body: JSON.stringify(payload) });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return { data: null, error: (errBody as { error?: string }).error ?? res.statusText };
      }
      const body = (await res.json()) as { data?: T };
      return { data: body.data ?? null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "Request failed" };
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<SingleResult<T>> {
    if (table !== "observations") return { data: null, error: "Cloudflare adapter supports only observations table" };
    const patch: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(data, "notes")) patch.notes = (data as Record<string, unknown>).notes;
    if (Object.prototype.hasOwnProperty.call(data, "location")) patch.location = (data as Record<string, unknown>).location;
    if (Object.prototype.hasOwnProperty.call(data, "verified_at")) patch.verified_at = (data as Record<string, unknown>).verified_at;
    if (Object.prototype.hasOwnProperty.call(data, "verification_payload")) patch.verification_payload = (data as Record<string, unknown>).verification_payload;
    if (Object.keys(patch).length === 0) return this.getById<T>(table, id);
    try {
      const res = await cfFetch(`api/observations/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return { data: null, error: (errBody as { error?: string }).error ?? res.statusText };
      }
      const body = (await res.json()) as { data?: T };
      return { data: body.data ?? null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "Request failed" };
    }
  }

  async remove(table: string, id: string): Promise<{ error?: string }> {
    if (table !== "observations") return { error: "Cloudflare adapter supports only observations table" };
    try {
      const res = await cfFetch(`api/observations/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return { error: (errBody as { error?: string }).error ?? res.statusText };
      }
      return {};
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Request failed" };
    }
  }
}

// ─── Export singleton ────────────────────────────────────────

export const db: DatabaseAdapter = isCloudflareConfigured ? new CloudflareAdapter() : new SupabaseAdapter();
