import { describe, it, expect, beforeEach } from "vitest";
import {
  getLocalProgress,
  saveLocalProgress,
  checkNewBadges,
  BADGES,
  type UserProgressLocal,
} from "@/lib/gamification";

describe("gamification", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("getLocalProgress", () => {
    it("returns default progress when localStorage is empty", () => {
      const progress = getLocalProgress();
      expect(progress.constellationsFound).toEqual([]);
      expect(progress.totalObservations).toBe(0);
      expect(progress.streakDays).toBe(0);
      expect(progress.lastObservationDate).toBeNull();
      expect(progress.badgesEarned).toEqual([]);
    });

    it("returns parsed progress when localStorage has valid data", () => {
      const stored: UserProgressLocal = {
        constellationsFound: ["orion", "cassiopeia"],
        totalObservations: 5,
        streakDays: 2,
        lastObservationDate: "2025-01-10",
        badgesEarned: ["first-find"],
      };
      window.localStorage.setItem("alnitar_progress", JSON.stringify(stored));
      const progress = getLocalProgress();
      expect(progress.constellationsFound).toEqual(["orion", "cassiopeia"]);
      expect(progress.totalObservations).toBe(5);
      expect(progress.badgesEarned).toEqual(["first-find"]);
    });
  });

  describe("saveLocalProgress", () => {
    it("persists progress to localStorage", () => {
      const progress: UserProgressLocal = {
        constellationsFound: ["orion"],
        totalObservations: 1,
        streakDays: 1,
        lastObservationDate: "2025-01-10",
        badgesEarned: ["first-find"],
      };
      saveLocalProgress(progress);
      const raw = window.localStorage.getItem("alnitar_progress");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.constellationsFound).toEqual(["orion"]);
      expect(parsed.badgesEarned).toEqual(["first-find"]);
    });
  });

  describe("checkNewBadges", () => {
    it("returns first-find when user has no constellations", () => {
      const progress: UserProgressLocal = {
        constellationsFound: [],
        totalObservations: 0,
        streakDays: 0,
        lastObservationDate: null,
        badgesEarned: [],
      };
      const newBadges = checkNewBadges("orion", progress);
      expect(newBadges).toContain("first-find");
    });

    it("returns five-finds when user reaches 5 constellations", () => {
      const progress: UserProgressLocal = {
        constellationsFound: ["orion", "cassiopeia", "ursa-major", "cygnus"],
        totalObservations: 4,
        streakDays: 0,
        lastObservationDate: null,
        badgesEarned: ["first-find"],
      };
      const newBadges = checkNewBadges("leo", progress);
      expect(newBadges).toContain("five-finds");
    });

    it("returns empty when constellation already found", () => {
      const progress: UserProgressLocal = {
        constellationsFound: ["orion"],
        totalObservations: 1,
        streakDays: 0,
        lastObservationDate: null,
        badgesEarned: ["first-find"],
      };
      const newBadges = checkNewBadges("orion", progress);
      expect(newBadges).toEqual([]);
    });
  });

  describe("BADGES", () => {
    it("defines expected milestone badges", () => {
      const ids = BADGES.map((b) => b.id);
      expect(ids).toContain("first-find");
      expect(ids).toContain("five-finds");
      expect(ids).toContain("nebula-hunter");
    });
  });
});
