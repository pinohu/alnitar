// src/lib/journal.test.ts — Journal add, get, delete, and filter behavior
import { describe, it, expect, beforeEach } from "vitest";
import {
  getJournalEntries,
  addJournalEntry,
  deleteJournalEntry,
  updateJournalEntry,
  exportJournalAsCsv,
} from "@/lib/journal";

describe("journal", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getJournalEntries returns empty array when no data", () => {
    expect(getJournalEntries()).toEqual([]);
  });

  it("addJournalEntry adds an entry and getJournalEntries returns it", () => {
    const entry = addJournalEntry({
      date: "2026-01-15",
      constellationId: "ori",
      constellationName: "Orion",
      confidence: 92,
      notes: "Clear view",
      location: "Backyard",
    });
    expect(entry.id).toBeDefined();
    expect(entry.createdAt).toBeDefined();
    expect(entry.constellationName).toBe("Orion");
    const entries = getJournalEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].constellationName).toBe("Orion");
    expect(entries[0].notes).toBe("Clear view");
  });

  it("deleteJournalEntry removes the entry", () => {
    const added = addJournalEntry({
      date: "2026-01-15",
      constellationId: "ori",
      constellationName: "Orion",
      confidence: 90,
      notes: "",
      location: "Unknown",
    });
    expect(getJournalEntries().length).toBe(1);
    deleteJournalEntry(added.id);
    expect(getJournalEntries().length).toBe(0);
  });

  it("updateJournalEntry updates notes and location", () => {
    const added = addJournalEntry({
      date: "2026-01-15",
      constellationId: "ori",
      constellationName: "Orion",
      confidence: 90,
      notes: "First",
      location: "Home",
    });
    updateJournalEntry(added.id, { notes: "Updated notes", location: "Park" });
    const entries = getJournalEntries();
    expect(entries[0].notes).toBe("Updated notes");
    expect(entries[0].location).toBe("Park");
  });

  it("filter by constellation name (in-memory) yields correct subset", () => {
    addJournalEntry({
      date: "2026-01-01",
      constellationId: "ori",
      constellationName: "Orion",
      confidence: 85,
      notes: "",
      location: "A",
    });
    addJournalEntry({
      date: "2026-01-02",
      constellationId: "uma",
      constellationName: "Ursa Major",
      confidence: 80,
      notes: "",
      location: "B",
    });
    const all = getJournalEntries();
    const orionOnly = all.filter((e) => e.constellationName.toLowerCase().includes("orion"));
    expect(orionOnly.length).toBe(1);
    expect(orionOnly[0].constellationName).toBe("Orion");
  });

  it("exportJournalAsCsv includes header and rows", () => {
    addJournalEntry({
      date: "2026-01-15",
      constellationId: "ori",
      constellationName: "Orion",
      confidence: 90,
      notes: "Notes",
      location: "Here",
    });
    const csv = exportJournalAsCsv(getJournalEntries());
    expect(csv).toContain("date,constellationName");
    expect(csv).toContain("Orion");
    expect(csv).toContain("Here");
  });
});
