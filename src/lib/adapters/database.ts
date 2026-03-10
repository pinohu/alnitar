/**
 * Database Abstraction Layer
 * 
 * Provides a portable interface for data access.
 * Current adapter: Supabase (via Lovable Cloud)
 * Future adapters: Cloudflare D1, PlanetScale, Turso, etc.
 */

import { supabase } from "@/integrations/supabase/client";

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

// ─── Export singleton ────────────────────────────────────────

export const db: DatabaseAdapter = new SupabaseAdapter();
