/**
 * Supabase-backed favorites. Use when user is authenticated and Supabase is configured.
 * Returns data in SavedItem-like shape for compatibility with favoritesService.
 */

import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { SavedItem } from "@/types/domain";

export async function fetchFavorites(userId: string): Promise<SavedItem[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("id, user_id, item_type, item_id, name, saved_at")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    itemType: row.item_type as SavedItem["itemType"],
    itemId: row.item_id,
    savedAt: row.saved_at,
    ...(row.name ? { name: row.name } : {}),
  })) as SavedItem[];
}

export async function addFavorite(
  userId: string,
  itemType: SavedItem["itemType"],
  itemId: string,
  name?: string
): Promise<SavedItem | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("favorites")
    .upsert(
      {
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        name: name ?? null,
        saved_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,item_type,item_id",
        ignoreDuplicates: false,
      }
    )
    .select("id, user_id, item_type, item_id, name, saved_at")
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    itemType: data.item_type as SavedItem["itemType"],
    itemId: data.item_id,
    savedAt: data.saved_at,
  };
}

export async function removeFavorite(
  userId: string,
  itemType: SavedItem["itemType"],
  itemId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId);

  return !error;
}
