/**
 * Event awareness — unit tests for real astronomy event data (no placeholders).
 */

import { describe, it, expect } from "vitest";
import { getUpcomingEvents, getEventById, getAllEvents } from "./eventAwareness";

describe("eventAwareness", () => {
  it("getAllEvents returns seeded 2026 events", () => {
    const events = getAllEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.id && e.title && e.date && e.type)).toBe(true);
    const types = new Set(events.map((e) => e.type));
    expect(types.has("meteor-shower")).toBe(true);
    expect(types.has("opposition")).toBe(true);
  });

  it("getEventById returns event when id exists", () => {
    const e = getEventById("perseids-2026");
    expect(e).toBeDefined();
    expect(e?.title).toContain("Perseid");
    expect(e?.type).toBe("meteor-shower");
  });

  it("getEventById returns undefined for unknown id", () => {
    expect(getEventById("nonexistent")).toBeUndefined();
  });

  it("getUpcomingEvents returns events within window", () => {
    const aug2026 = new Date("2026-08-01");
    const events = getUpcomingEvents(aug2026, 30);
    expect(events.length).toBeGreaterThan(0);
    const perseids = events.find((e) => e.id === "perseids-2026");
    expect(perseids).toBeDefined();
  });
});
