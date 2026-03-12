// src/lib/favoritesService.ts — Saved items: localStorage for guests; Supabase for authenticated users when configured.

import { getItem, setItem, STORAGE_KEYS } from "@/lib/clientStorage";
import type { SavedItem } from "@/types/domain";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  fetchFavorites,
  addFavorite as supabaseAddFavorite,
  removeFavorite as supabaseRemoveFavorite,
} from "@/lib/supabaseFavorites";

const GUEST_USER_ID = "guest";

function storageKey(userId: string): string {
  return `${STORAGE_KEYS.FAVORITES}_${userId}`;
}

function loadItems(userId: string): SavedItem[] {
  try {
    const raw = getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is SavedItem =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as SavedItem).id === "string" &&
        typeof (x as SavedItem).userId === "string" &&
        ["object", "event", "constellation", "dso"].includes((x as SavedItem).itemType) &&
        typeof (x as SavedItem).itemId === "string" &&
        typeof (x as SavedItem).savedAt === "string"
    );
  } catch {
    return [];
  }
}

function saveItems(userId: string, items: SavedItem[]): void {
  setItem(storageKey(userId), JSON.stringify(items));
}

/** Get all saved items for the user (or guest). Sync read from localStorage (hydrate with refreshFavoritesFromServer when user is set). */
export function getSavedItems(userId: string | undefined): SavedItem[] {
  return loadItems(userId ?? GUEST_USER_ID);
}

/** Fetch favorites from Supabase and write to localStorage so getSavedItems reflects server state. Call when user logs in or page loads. */
export async function refreshFavoritesFromServer(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const items = await fetchFavorites(userId);
  saveItems(userId, items);
  dispatchFavoritesUpdated();
}

/** Check if an item is saved. */
export function isSaved(
  userId: string | undefined,
  itemType: SavedItem["itemType"],
  itemId: string
): boolean {
  const items = loadItems(userId ?? GUEST_USER_ID);
  return items.some((x) => x.itemType === itemType && x.itemId === itemId);
}

/** Add a saved item. Returns the new SavedItem or null if already saved. Persists to Supabase when user is authenticated. */
export function addSavedItem(
  userId: string | undefined,
  itemType: SavedItem["itemType"],
  itemId: string,
  remind?: boolean,
  name?: string
): SavedItem | null {
  const uid = userId ?? GUEST_USER_ID;
  const items = loadItems(uid);
  if (items.some((x) => x.itemType === itemType && x.itemId === itemId)) return null;
  const savedAt = new Date().toISOString();
  const newItem: SavedItem = {
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userId: uid,
    itemType,
    itemId,
    savedAt,
    ...(remind !== undefined ? { remind } : {}),
  };
  items.push(newItem);
  saveItems(uid, items);
  if (uid !== GUEST_USER_ID && isSupabaseConfigured) {
    supabaseAddFavorite(uid, itemType, itemId, name).catch(() => {
      // Keep local state; server sync may retry later
    });
  }
  dispatchFavoritesUpdated();
  return newItem;
}

/** Remove a saved item. Returns true if removed. Persists to Supabase when user is authenticated. */
export function removeSavedItem(
  userId: string | undefined,
  itemType: SavedItem["itemType"],
  itemId: string
): boolean {
  const uid = userId ?? GUEST_USER_ID;
  const items = loadItems(uid).filter(
    (x) => !(x.itemType === itemType && x.itemId === itemId)
  );
  if (items.length === loadItems(uid).length) return false;
  saveItems(uid, items);
  if (uid !== GUEST_USER_ID && isSupabaseConfigured) {
    supabaseRemoveFavorite(uid, itemType, itemId).catch(() => {});
  }
  dispatchFavoritesUpdated();
  return true;
}

/** Toggle saved state. Returns new saved state (true = now saved). */
export function toggleSavedItem(
  userId: string | undefined,
  itemType: SavedItem["itemType"],
  itemId: string
): boolean {
  if (isSaved(userId, itemType, itemId)) {
    removeSavedItem(userId, itemType, itemId);
    return false;
  }
  addSavedItem(userId, itemType, itemId);
  return true;
}

const EVENT_NAME = "alnitar_favorites_updated";

function dispatchFavoritesUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/** Subscribe to favorites changes (e.g. after toggle). Call in useEffect and return cleanup. */
export function subscribeFavoritesUpdated(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_NAME, cb);
  return () => window.removeEventListener(EVENT_NAME, cb);
}
