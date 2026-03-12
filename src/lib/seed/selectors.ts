/**
 * Featured and homepage selectors — curated slugs for “Tonight in the Sky” and discovery.
 * Use for homepage feed, highlights, and beginner picks.
 * Tonight feed uses date + hemisphere + season calculator when date is provided.
 */

import { seedCelestialObjects } from "@/data/seed";
import { seedAstronomyEvents } from "@/data/seed";
import { calculateTonightExperience } from "@/lib/tonightCalculator";
import type { SeedCelestialObject, SeedAstronomyEvent, Hemisphere } from "@/types/astronomy";

const FEATURED_OBJECT_SLUGS = [
  "moon",
  "jupiter",
  "saturn",
  "orion",
  "orion-nebula",
  "andromeda-galaxy",
  "pleiades",
  "ring-nebula",
  "whirlpool-galaxy",
  "polaris",
  "sirius",
  "vega",
] as const;

const FEATURED_EVENT_SLUGS = [
  "perseids",
  "geminids",
  "quadrantids",
  "lyrids",
  "mars-opposition",
  "jupiter-opposition",
  "saturn-opposition",
  "total-lunar-eclipse",
  "total-solar-eclipse",
  "summer-triangle-season",
  "galactic-center-season",
  "messier-marathon",
] as const;

export function getFeaturedObjects(limit = 12): SeedCelestialObject[] {
  const featured = FEATURED_OBJECT_SLUGS.map((slug) =>
    seedCelestialObjects.find((o) => o.slug === slug)
  ).filter((o): o is SeedCelestialObject => o != null);
  return featured.slice(0, limit);
}

export function getFeaturedEvents(limit = 12): SeedAstronomyEvent[] {
  const featured = FEATURED_EVENT_SLUGS.map((slug) =>
    seedAstronomyEvents.find((e) => e.slug === slug)
  ).filter((e): e is SeedAstronomyEvent => e != null);
  return featured.slice(0, limit);
}

export function getBeginnerObjects(limit = 12): SeedCelestialObject[] {
  return seedCelestialObjects
    .filter((o) => o.tags.includes("beginner"))
    .slice(0, limit);
}

export interface TonightSkyFeed {
  hemisphere: Hemisphere;
  /** Present when using date-based calculator. */
  season?: "winter" | "spring" | "summer" | "autumn";
  featuredObjects: SeedCelestialObject[];
  featuredEvents: SeedAstronomyEvent[];
  beginnerObjects: SeedCelestialObject[];
  visibleObjects: SeedCelestialObject[];
  timelyEvents: SeedAstronomyEvent[];
}

/**
 * Homepage-ready “Tonight in the Sky” feed using date + hemisphere + season.
 * Scores objects/events by visibility and peak relevance (heuristic, not ephemeris).
 */
export function getTonightSkyFeed(
  hemisphere: Hemisphere = "both",
  date?: Date
): TonightSkyFeed {
  const exp = calculateTonightExperience({
    hemisphere,
    date: date ?? new Date(),
  });
  return {
    hemisphere: exp.hemisphere,
    season: exp.season,
    featuredObjects: exp.featuredObjects,
    featuredEvents: exp.featuredEvents,
    beginnerObjects: exp.beginnerObjects,
    visibleObjects: exp.visibleObjects,
    timelyEvents: exp.timelyEvents,
  };
}
