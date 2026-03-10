import { describe, it, expect } from "vitest";
import { LearningService } from "@/lib/services/learningService";

describe("LearningService", () => {
  describe("getConstellations", () => {
    it("returns all constellations when no filters", () => {
      const result = LearningService.getConstellations();
      expect(result.length).toBeGreaterThan(20);
    });

    it("filters by season", () => {
      const result = LearningService.getConstellations({ season: "Winter" });
      expect(result.length).toBeGreaterThan(0);
      result.forEach((c) => expect(c.bestSeason).toBe("Winter"));
    });

    it("filters by search query", () => {
      const result = LearningService.getConstellations({ search: "Orion" });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((c) => c.name === "Orion")).toBe(true);
    });

    it("filters by hemisphere", () => {
      const result = LearningService.getConstellations({ hemisphere: "northern" });
      result.forEach((c) =>
        expect(["northern", "both"]).toContain(c.hemisphere)
      );
    });
  });

  describe("getConstellationBySlug", () => {
    it("returns Orion for slug orion", () => {
      const c = LearningService.getConstellationBySlug("orion");
      expect(c).toBeDefined();
      expect(c!.name).toBe("Orion");
      expect(c!.stars.length).toBeGreaterThan(0);
    });

    it("returns undefined for unknown slug", () => {
      const c = LearningService.getConstellationBySlug("unknown-foo");
      expect(c).toBeUndefined();
    });
  });

  describe("getDSOsForConstellation", () => {
    it("returns DSOs for orion", () => {
      const dsos = LearningService.getDSOsForConstellation("orion");
      expect(Array.isArray(dsos)).toBe(true);
      dsos.forEach((d) => expect(d.constellation).toBe("orion"));
    });
  });

  describe("getStats", () => {
    it("returns constellation and DSO counts", () => {
      const stats = LearningService.getStats();
      expect(stats.constellationCount).toBeGreaterThan(0);
      expect(stats.dsoCount).toBeGreaterThan(0);
      expect(stats.seasons).toContain("Winter");
      expect(stats.hemispheres).toContain("northern");
    });
  });
});
