/**
 * Seed object service — list and get celestial objects from the unified seed dataset.
 * Supports filter by type, hemisphere, tag, and full-text search.
 */

import { seedCelestialObjects } from "@/data/seed";
import type { SeedCelestialObject, Hemisphere, SeedObjectType } from "@/types/astronomy";

export interface SeedObjectFilters {
  type?: SeedObjectType;
  hemisphere?: Hemisphere;
  tag?: string;
  q?: string;
  limit?: number;
}

export function getSeedObjects(filters: SeedObjectFilters = {}): SeedCelestialObject[] {
  let results = [...seedCelestialObjects];
  const q = (filters.q ?? "").trim().toLowerCase();
  if (q) {
    results = results.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.slug.toLowerCase().includes(q) ||
        o.subtype.toLowerCase().includes(q) ||
        o.summary.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (filters.type) {
    results = results.filter((o) => o.type === filters.type);
  }
  if (filters.hemisphere) {
    results = results.filter((o) => o.hemisphere === filters.hemisphere || o.hemisphere === "both");
  }
  if (filters.tag) {
    const tag = filters.tag.trim().toLowerCase();
    results = results.filter((o) => o.tags.some((t) => t.toLowerCase() === tag));
  }
  const limit = filters.limit ?? 0;
  if (limit > 0) results = results.slice(0, limit);
  return results;
}

export function getSeedObjectBySlug(slug: string): SeedCelestialObject | undefined {
  return seedCelestialObjects.find((o) => o.slug === slug);
}

export function getSeedObjectById(id: string): SeedCelestialObject | undefined {
  return seedCelestialObjects.find((o) => o.id === id);
}

/** Get object by slug (alias for getSeedObjectBySlug). Returns null when not found for API-style callers. */
export function getObjectBySlug(slug: string): SeedCelestialObject | null {
  return getSeedObjectBySlug(slug) ?? null;
}

/** Related objects by shared type and tags; same type +2, each shared tag +1, sorted by score. */
export function getRelatedObjects(slug: string, limit = 6): SeedCelestialObject[] {
  const source = getSeedObjectBySlug(slug);
  if (!source) return [];
  const tagSet = new Set(source.tags);
  return seedCelestialObjects
    .filter((o) => o.slug !== slug)
    .map((o) => {
      let score = o.type === source.type ? 2 : 0;
      for (const t of o.tags) if (tagSet.has(t)) score += 1;
      return { item: o, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((e) => e.item);
}

/** Single object by slug with related list (for slug “route” / detail payload). */
export function getObjectBySlugWithRelated(slug: string, relatedLimit = 6): { item: SeedCelestialObject; related: SeedCelestialObject[] } | null {
  const item = getSeedObjectBySlug(slug) ?? null;
  if (!item) return null;
  return { item, related: getRelatedObjects(slug, relatedLimit) };
}
