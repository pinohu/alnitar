// src/lib/favoritesService.test.ts — Favorites add, remove, toggle, list
import { describe, it, expect, beforeEach } from "vitest";
import {
  getSavedItems,
  isSaved,
  addSavedItem,
  removeSavedItem,
  toggleSavedItem,
} from "@/lib/favoritesService";

describe("favoritesService", () => {
  const uid = "test-user";

  beforeEach(() => {
    localStorage.clear();
  });

  it("getSavedItems returns empty when none saved", () => {
    expect(getSavedItems(uid)).toEqual([]);
  });

  it("addSavedItem adds and getSavedItems returns it", () => {
    const item = addSavedItem(uid, "dso", "M42");
    expect(item).not.toBeNull();
    expect(item!.itemType).toBe("dso");
    expect(item!.itemId).toBe("M42");
    expect(item!.userId).toBe(uid);
    const list = getSavedItems(uid);
    expect(list.length).toBe(1);
    expect(list[0].itemId).toBe("M42");
  });

  it("addSavedItem returns null when already saved", () => {
    addSavedItem(uid, "event", "e1");
    const second = addSavedItem(uid, "event", "e1");
    expect(second).toBeNull();
    expect(getSavedItems(uid).length).toBe(1);
  });

  it("isSaved returns true after add, false after remove", () => {
    expect(isSaved(uid, "dso", "M31")).toBe(false);
    addSavedItem(uid, "dso", "M31");
    expect(isSaved(uid, "dso", "M31")).toBe(true);
    removeSavedItem(uid, "dso", "M31");
    expect(isSaved(uid, "dso", "M31")).toBe(false);
  });

  it("removeSavedItem returns false when item was not saved", () => {
    expect(removeSavedItem(uid, "dso", "M99")).toBe(false);
  });

  it("toggleSavedItem toggles state", () => {
    expect(toggleSavedItem(uid, "event", "ev1")).toBe(true);
    expect(isSaved(uid, "event", "ev1")).toBe(true);
    expect(toggleSavedItem(uid, "event", "ev1")).toBe(false);
    expect(isSaved(uid, "event", "ev1")).toBe(false);
  });

  it("guest user uses guest key", () => {
    addSavedItem(undefined, "dso", "M44");
    const list = getSavedItems(undefined);
    expect(list.length).toBe(1);
    expect(list[0].userId).toBe("guest");
  });
});
