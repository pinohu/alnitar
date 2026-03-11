/**
 * Celestial explorer search — unit tests.
 */

import { describe, it, expect } from "vitest";
import { searchCelestialObjects } from "./search";
import { isConstellationItem, isDSOItem } from "./types";

describe("searchCelestialObjects", () => {
  it("returns constellations and DSOs when no filter", () => {
    const result = searchCelestialObjects({});
    expect(result.length).toBeGreaterThan(0);
    const constellations = result.filter(isConstellationItem);
    const dsos = result.filter(isDSOItem);
    expect(constellations.length).toBeGreaterThan(0);
    expect(dsos.length).toBeGreaterThan(0);
  });

  it("filters by query: Orion returns Orion constellation and M42", () => {
    const result = searchCelestialObjects({ query: "Orion" });
    const constellations = result.filter(isConstellationItem);
    const dsos = result.filter(isDSOItem);
    expect(constellations.some((c) => c.data.name === "Orion")).toBe(true);
    expect(dsos.some((d) => d.data.id === "m42")).toBe(true);
  });

  it("filters by query: M31 returns Andromeda Galaxy", () => {
    const result = searchCelestialObjects({ query: "M31" });
    const dsos = result.filter(isDSOItem);
    expect(dsos.some((d) => d.data.catalog === "M31")).toBe(true);
  });

  it("filter kind constellation returns only constellations", () => {
    const result = searchCelestialObjects({ kind: "constellation" });
    expect(result.every(isConstellationItem)).toBe(true);
  });

  it("filter kind galaxy returns only galaxies", () => {
    const result = searchCelestialObjects({ kind: "galaxy" });
    expect(result.every(isDSOItem)).toBe(true);
    expect(result.every((r) => isDSOItem(r) && r.data.type === "galaxy")).toBe(true);
  });

  it("filter kind nebula returns only nebulae", () => {
    const result = searchCelestialObjects({ kind: "nebula" });
    expect(result.every(isDSOItem)).toBe(true);
    expect(result.every((r) => isDSOItem(r) && r.data.type === "nebula")).toBe(true);
  });

  it("empty query with kind returns all of that kind", () => {
    const result = searchCelestialObjects({ kind: "cluster" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => isDSOItem(r) && r.data.type === "cluster")).toBe(true);
  });
});
