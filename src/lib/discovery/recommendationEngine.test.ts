import { describe, it, expect } from "vitest";
import { getDiscoveryRecommendations } from "@/lib/discovery/recommendationEngine";
import type { ObserverProfile } from "@/lib/discovery/types";

describe("recommendationEngine", () => {
  const baseProfile: ObserverProfile = {
    latitude: 40,
    longitude: 0,
    date: new Date("2025-01-15"),
    equipment: "naked-eye",
    experienceLevel: "beginner",
    constellationsFound: [],
    dsosObserved: [],
    totalObservations: 0,
  };

  describe("getDiscoveryRecommendations", () => {
    it("returns discovery result with categories", () => {
      const result = getDiscoveryRecommendations(baseProfile);
      expect(result).toBeDefined();
      expect(result.topPicks).toBeInstanceOf(Array);
      expect(result.beginnerPicks).toBeInstanceOf(Array);
      expect(result.binocularPicks).toBeInstanceOf(Array);
      expect(result.deepSkyPicks).toBeInstanceOf(Array);
      expect(result.challengePicks).toBeInstanceOf(Array);
      expect(result.settingSoon).toBeInstanceOf(Array);
      expect(result.upNext).toBeInstanceOf(Array);
      expect(result.events).toBeInstanceOf(Array);
      expect(result.challenge).toBeDefined();
      expect(typeof result.skyScore).toBe("number");
      expect(typeof result.moonPhase).toBe("string");
      expect(typeof result.moonBrightness).toBe("number");
    });

    it("topPicks has up to 3 items", () => {
      const result = getDiscoveryRecommendations(baseProfile);
      expect(result.topPicks.length).toBeLessThanOrEqual(3);
    });

    it("recommendations have id, objectName, objectType, category", () => {
      const result = getDiscoveryRecommendations(baseProfile);
      const allRecs = [
        ...result.topPicks,
        ...result.beginnerPicks,
        ...result.binocularPicks,
        ...result.deepSkyPicks,
      ];
      allRecs.forEach((r) => {
        expect(r.id).toBeDefined();
        expect(r.objectName).toBeDefined();
        expect(r.objectType).toBeDefined();
        expect(r.category).toBeDefined();
      });
    });

    it("challenge has title and description", () => {
      const result = getDiscoveryRecommendations(baseProfile);
      expect(result.challenge).toBeDefined();
      expect(result.challenge!.title).toBeDefined();
      expect(result.challenge!.description).toBeDefined();
    });

    it("upNext is array of recommendations", () => {
      const result = getDiscoveryRecommendations(baseProfile);
      expect(result.upNext).toBeInstanceOf(Array);
      result.upNext.forEach((r) => {
        expect(r.objectName).toBeDefined();
        expect(r.id).toBeDefined();
      });
    });
  });
});
