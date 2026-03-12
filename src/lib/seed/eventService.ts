/**
 * Seed event service — list and get astronomy events from the unified seed dataset.
 * Events are recurring patterns; date-specific instances can be computed by location/time.
 */

import { seedAstronomyEvents } from "@/data/seed";
import type { SeedAstronomyEvent, SeedEventType } from "@/types/astronomy";

export interface SeedEventFilters {
  type?: SeedEventType;
  bestFor?: string;
  tag?: string;
  q?: string;
  limit?: number;
}

export function getSeedEvents(filters: SeedEventFilters = {}): SeedAstronomyEvent[] {
  let results = [...seedAstronomyEvents];
  const q = (filters.q ?? "").trim().toLowerCase();
  if (q) {
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.recurrence.toLowerCase().includes(q) ||
        e.peakWindow.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (filters.type) {
    results = results.filter((e) => e.type === filters.type);
  }
  if (filters.bestFor) {
    const bf = filters.bestFor.trim().toLowerCase();
    results = results.filter((e) => e.bestFor.toLowerCase() === bf || e.bestFor === "both");
  }
  if (filters.tag) {
    const tag = filters.tag.trim().toLowerCase();
    results = results.filter((e) => e.tags.some((t) => t.toLowerCase() === tag));
  }
  const limit = filters.limit ?? 0;
  if (limit > 0) results = results.slice(0, limit);
  return results;
}

export function getSeedEventBySlug(slug: string): SeedAstronomyEvent | undefined {
  return seedAstronomyEvents.find((e) => e.slug === slug);
}

export function getSeedEventById(id: string): SeedAstronomyEvent | undefined {
  return seedAstronomyEvents.find((e) => e.id === id);
}

/** Get event by slug (alias for getSeedEventBySlug). Returns null when not found for API-style callers. */
export function getEventBySlug(slug: string): SeedAstronomyEvent | null {
  return getSeedEventBySlug(slug) ?? null;
}

/** Related events by shared type and tags; same type +2, each shared tag +1, sorted by score. */
export function getRelatedEvents(slug: string, limit = 6): SeedAstronomyEvent[] {
  const source = getSeedEventBySlug(slug);
  if (!source) return [];
  const tagSet = new Set(source.tags);
  return seedAstronomyEvents
    .filter((e) => e.slug !== slug)
    .map((e) => {
      let score = e.type === source.type ? 2 : 0;
      for (const t of e.tags) if (tagSet.has(t)) score += 1;
      return { item: e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

/** Single event by slug with related list (for slug “route” / detail payload). */
export function getEventBySlugWithRelated(slug: string, relatedLimit = 6): { item: SeedAstronomyEvent; related: SeedAstronomyEvent[] } | null {
  const item = getSeedEventBySlug(slug) ?? null;
  if (!item) return null;
  return { item, related: getRelatedEvents(slug, relatedLimit) };
}
