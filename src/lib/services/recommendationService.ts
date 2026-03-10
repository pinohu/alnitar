/**
 * Recommendation Service
 * 
 * Generates tonight-sky recommendations.
 * Uses cache adapter for performance. Mostly client-side computation.
 */

import { getTonightSkyData, type TonightSkyData } from "@/lib/tonight";
import { cache, CacheKeys } from "@/lib/adapters/cache";

export class RecommendationService {
  /** Get tonight's sky data, with caching */
  static async getTonightData(latitude = 40): Promise<TonightSkyData> {
    const cacheKey = `${CacheKeys.TONIGHT_DATA}_${latitude}`;
    const cached = await cache.get<TonightSkyData>(cacheKey);
    if (cached) return cached;

    const data = getTonightSkyData(new Date(), latitude);
    // Cache for 30 minutes
    await cache.set(cacheKey, data, 1800);
    return data;
  }

  /** Get the constellation of the night */
  static async getConstellationOfTheNight(): Promise<{ id: string; name: string } | null> {
    const cached = await cache.get<{ id: string; name: string }>(CacheKeys.CONSTELLATION_OF_NIGHT);
    if (cached) return cached;

    const data = getTonightSkyData();
    const top = data.bestConstellations[0];
    if (!top) return null;

    const result = { id: top.id, name: top.name };
    await cache.set(CacheKeys.CONSTELLATION_OF_NIGHT, result, 3600);
    return result;
  }

  /** Get homepage recommendation snippets */
  static async getHomepageRecommendations() {
    const cached = await cache.get<{ topConstellation?: string; skyScore?: number; moonPhase?: string }>(CacheKeys.HOMEPAGE_RECS);
    if (cached) return cached;

    const data = getTonightSkyData();
    const recs = {
      topConstellation: data.bestConstellations[0]?.name || "Orion",
      skyScore: data.skyScore,
      moonPhase: data.moonPhase,
      planetCount: data.visiblePlanets.length,
      deepSkyCount: data.deepSkyTargets.length,
    };
    await cache.set(CacheKeys.HOMEPAGE_RECS, recs, 1800);
    return recs;
  }
}
