/**
 * Tonight calculator — date + hemisphere + season–aware feed.
 * Scores seed objects and events by visibility/peak/season relevance (heuristic, not ephemeris).
 */

import { seedCelestialObjects } from "@/data/seed";
import { seedAstronomyEvents } from "@/data/seed";
import type {
  SeedCelestialObject,
  SeedAstronomyEvent,
  Hemisphere,
} from "@/types/astronomy";

export type Season = "winter" | "spring" | "summer" | "autumn";

function getSeason(date: Date, hemisphere: Hemisphere): Season {
  const month = date.getUTCMonth() + 1;
  const north: Season =
    month === 12 || month <= 2
      ? "winter"
      : month <= 5
        ? "spring"
        : month <= 8
          ? "summer"
          : "autumn";
  if (hemisphere === "south") {
    return north === "winter"
      ? "summer"
      : north === "summer"
        ? "winter"
        : north === "spring"
          ? "autumn"
          : "spring";
  }
  return north;
}

function matchHemisphere(
  itemHemisphere: string,
  hemisphere: Hemisphere
): boolean {
  return (
    hemisphere === "both" ||
    itemHemisphere === "both" ||
    itemHemisphere === hemisphere
  );
}

function matchSeasonText(text: string, season: string): boolean {
  const value = text.toLowerCase();
  return (
    value.includes(season) ||
    value.includes("year-round") ||
    value.includes("varies") ||
    value.includes("all year")
  );
}

function scoreObject(
  item: SeedCelestialObject,
  hemisphere: Hemisphere,
  season: string
): number {
  let score = 0;
  if (matchHemisphere(item.hemisphere, hemisphere)) score += 3;
  if (matchSeasonText(item.visibility, season)) score += 4;
  if (item.tags.includes("beginner")) score += 2;
  if (["planet", "moon", "constellation", "star"].includes(item.type))
    score += 1;
  return score;
}

function scoreEvent(
  item: SeedAstronomyEvent,
  hemisphere: Hemisphere,
  season: string
): number {
  let score = 0;
  const bf = (item.bestFor ?? "").toLowerCase();
  if (
    bf === "both" ||
    bf === hemisphere ||
    bf.includes("dependent") ||
    bf.includes("specific")
  )
    score += 3;
  if (
    matchSeasonText(item.peakWindow, season) ||
    matchSeasonText(item.summary, season)
  )
    score += 4;
  if (item.tags.includes("beginner")) score += 2;
  if (
    item.type === "meteor-shower" ||
    item.type === "observing-season" ||
    item.type === "planetary-event"
  )
    score += 1;
  return score;
}

export interface TonightExperience {
  date: string;
  hemisphere: Hemisphere;
  season: Season;
  featuredObjects: SeedCelestialObject[];
  featuredEvents: SeedAstronomyEvent[];
  beginnerObjects: SeedCelestialObject[];
  visibleObjects: SeedCelestialObject[];
  timelyEvents: SeedAstronomyEvent[];
}

/**
 * Compute a season- and hemisphere-aware “tonight” feed.
 * Uses scoring heuristics on visibility/peakWindow/summary; not a full ephemeris.
 */
export function calculateTonightExperience(input?: {
  date?: Date;
  hemisphere?: Hemisphere;
}): TonightExperience {
  const date = input?.date ?? new Date();
  const hemisphere = input?.hemisphere ?? "both";
  const season = getSeason(date, hemisphere);

  const visibleObjects = [...seedCelestialObjects]
    .map((item) => ({ item, score: scoreObject(item, hemisphere, season) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map((entry) => entry.item);

  const timelyEvents = [...seedAstronomyEvents]
    .map((item) => ({ item, score: scoreEvent(item, hemisphere, season) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((entry) => entry.item);

  const featuredObjects = visibleObjects.slice(0, 6);
  const featuredEvents = timelyEvents.slice(0, 6);
  const beginnerObjects = visibleObjects
    .filter((o) => o.tags.includes("beginner"))
    .slice(0, 6);

  return {
    date: date.toISOString(),
    hemisphere,
    season,
    featuredObjects,
    featuredEvents,
    beginnerObjects,
    visibleObjects,
    timelyEvents,
  };
}
