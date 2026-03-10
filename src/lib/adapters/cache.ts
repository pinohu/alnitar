/**
 * Cache Abstraction Layer
 * 
 * Provides a portable interface for lightweight caching/config.
 * Current adapter: localStorage + in-memory
 * Future adapters: Cloudflare Workers KV, Redis, etc.
 * 
 * Use for:
 *   - constellation of the night
 *   - cached tonight recommendation summaries
 *   - homepage recommendation snippets
 *   - tip of the day
 *   - lightweight app config
 */

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

// ─── In-Memory + LocalStorage Adapter ────────────────────────

class LocalCacheAdapter implements CacheAdapter {
  private memoryCache = new Map<string, { value: unknown; expires: number }>();
  private prefix = "alnitar_cache_";

  async get<T>(key: string): Promise<T | null> {
    // Check memory first
    const mem = this.memoryCache.get(key);
    if (mem) {
      if (mem.expires > Date.now()) return mem.value as T;
      this.memoryCache.delete(key);
    }

    // Check localStorage
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { value: T; expires: number };
      if (parsed.expires > Date.now()) {
        this.memoryCache.set(key, parsed);
        return parsed.value;
      }
      localStorage.removeItem(this.prefix + key);
    } catch { /* ignore */ }
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    const entry = { value, expires: Date.now() + ttlSeconds * 1000 };
    this.memoryCache.set(key, entry);
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch { /* storage full, memory-only */ }
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try { localStorage.removeItem(this.prefix + key); } catch { /* ignore */ }
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }
}

// ─── Export ──────────────────────────────────────────────────

export const cache: CacheAdapter = new LocalCacheAdapter();

// ─── Prebuilt cache keys ─────────────────────────────────────

export const CacheKeys = {
  TONIGHT_DATA: "tonight_data",
  CONSTELLATION_OF_NIGHT: "constellation_of_night",
  HOMEPAGE_RECS: "homepage_recommendations",
  TIP_OF_DAY: "tip_of_day",
  APP_CONFIG: "app_config",
} as const;
