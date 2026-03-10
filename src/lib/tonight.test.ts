import { describe, it, expect } from "vitest";
import { getTonightSkyData } from "@/lib/tonight";

describe("tonight", () => {
  describe("getTonightSkyData", () => {
    it("returns TonightSkyData with all required fields", () => {
      const data = getTonightSkyData();
      expect(data).toBeDefined();
      expect(data.bestConstellations).toBeInstanceOf(Array);
      expect(data.visiblePlanets).toBeInstanceOf(Array);
      expect(data.deepSkyTargets).toBeInstanceOf(Array);
      expect(data.beginnerTargets).toBeInstanceOf(Array);
      expect(typeof data.skyScore).toBe("number");
      expect(data.skyScore).toBeGreaterThanOrEqual(0);
      expect(data.skyScore).toBeLessThanOrEqual(100);
      expect(typeof data.moonPhase).toBe("string");
      expect(data.moonPhase.length).toBeGreaterThan(0);
      expect(typeof data.moonBrightness).toBe("number");
      expect(typeof data.darkness).toBe("number");
    });

    it("moon phase is one of known values", () => {
      const knownPhases = [
        "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
        "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
      ];
      const data = getTonightSkyData();
      expect(knownPhases).toContain(data.moonPhase);
    });

    it("bestConstellations and beginnerTargets are filtered by hemisphere for northern lat", () => {
      const data = getTonightSkyData(new Date(), 40);
      data.bestConstellations.forEach((c) => {
        expect(["northern", "both"]).toContain(c.hemisphere);
      });
      data.beginnerTargets.forEach((c) => {
        expect(["northern", "both"]).toContain(c.hemisphere);
      });
    });

    it("beginnerTargets have difficulty <= 2", () => {
      const data = getTonightSkyData();
      data.beginnerTargets.forEach((c) => {
        expect(c.difficulty ?? 3).toBeLessThanOrEqual(2);
      });
    });

    it("respects custom date and latitude", () => {
      const date = new Date("2025-06-15");
      const data = getTonightSkyData(date, -33);
      expect(data.bestConstellations).toBeInstanceOf(Array);
      data.bestConstellations.forEach((c) => {
        expect(["southern", "both"]).toContain(c.hemisphere);
      });
    });
  });
});
