/**
 * Learning Service
 * 
 * Provides constellation learning library data.
 * Uses static/seeded client-side data for affordability.
 * Ready for future DB-backed content management.
 */

import { constellations, type Constellation } from "@/data/constellations";
import { deepSkyCatalog, type DeepSkyCatalogObject } from "@/data/deepSkyObjects";

export type SeasonFilter = "Winter" | "Spring" | "Summer" | "Autumn" | "all";
export type DifficultyFilter = 1 | 2 | 3 | 4 | 5 | "all";
export type HemisphereFilter = "northern" | "southern" | "both" | "all";

export interface LearnFilters {
  season?: SeasonFilter;
  difficulty?: DifficultyFilter;
  hemisphere?: HemisphereFilter;
  search?: string;
}

export class LearningService {
  /** Get all constellations with optional filters */
  static getConstellations(filters?: LearnFilters): Constellation[] {
    let result = [...constellations];

    if (filters?.season && filters.season !== "all") {
      result = result.filter(c => c.bestSeason === filters.season);
    }
    if (filters?.difficulty && filters.difficulty !== "all") {
      result = result.filter(c => (c.difficulty ?? 3) <= (filters.difficulty as number));
    }
    if (filters?.hemisphere && filters.hemisphere !== "all") {
      result = result.filter(c =>
        c.hemisphere === filters.hemisphere || c.hemisphere === "both"
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.alternateNames.some(n => n.toLowerCase().includes(q))
      );
    }

    return result;
  }

  /** Get a single constellation by slug/id */
  static getConstellationBySlug(slug: string): Constellation | undefined {
    return constellations.find(c => c.id === slug);
  }

  /** Get deep sky objects for a constellation */
  static getDSOsForConstellation(constellationId: string): DeepSkyCatalogObject[] {
    return deepSkyCatalog.filter(d => d.constellation === constellationId);
  }

  /** Get all deep sky objects */
  static getAllDSOs(): DeepSkyCatalogObject[] {
    return deepSkyCatalog;
  }

  /** Get count stats */
  static getStats() {
    return {
      constellationCount: constellations.length,
      dsoCount: deepSkyCatalog.length,
      seasons: ["Winter", "Spring", "Summer", "Autumn"],
      hemispheres: ["northern", "southern", "both"],
    };
  }
}
