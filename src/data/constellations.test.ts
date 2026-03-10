import { describe, it, expect } from "vitest";
import { constellations } from "@/data/constellations";

describe("constellations seed data", () => {
  it("has required constellation count", () => {
    expect(constellations.length).toBeGreaterThanOrEqual(25);
  });

  it("each constellation has required fields", () => {
    constellations.forEach((c) => {
      expect(c.id).toBeDefined();
      expect(c.name).toBeDefined();
      expect(c.slug).toBeDefined();
      expect(c.stars).toBeInstanceOf(Array);
      expect(c.stars.length).toBeGreaterThan(0);
      expect(c.lines).toBeInstanceOf(Array);
      expect(c.bestMonths).toBeInstanceOf(Array);
      expect(["northern", "southern", "both"]).toContain(c.hemisphere);
      expect(typeof c.mythology).toBe("string");
      expect(typeof c.funFact).toBe("string");
    });
  });

  it("Orion exists and has belt stars", () => {
    const orion = constellations.find((c) => c.id === "orion");
    expect(orion).toBeDefined();
    expect(orion!.name).toBe("Orion");
    const beltStars = ["Alnitak", "Alnilam", "Mintaka"];
    const starNames = orion!.stars.map((s) => s.name);
    beltStars.forEach((name) => expect(starNames).toContain(name));
  });
});
