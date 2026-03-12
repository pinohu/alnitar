// src/hooks/use-favorites.ts — React hook for saved/favorite state and toggle; syncs with favoritesService.

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getSavedItems,
  isSaved as checkSaved,
  toggleSavedItem,
  subscribeFavoritesUpdated,
  refreshFavoritesFromServer,
} from "@/lib/favoritesService";
import type { SavedItem } from "@/types/domain";

export function useFavoritesList(): SavedItem[] {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState<SavedItem[]>(() => getSavedItems(userId));

  useEffect(() => {
    if (userId) {
      refreshFavoritesFromServer(userId).then(() =>
        setItems(getSavedItems(userId))
      );
    } else {
      setItems(getSavedItems(userId));
    }
    return subscribeFavoritesUpdated(() => setItems(getSavedItems(userId)));
  }, [userId]);

  return items;
}

export function useFavorite(
  itemType: SavedItem["itemType"],
  itemId: string
): { isSaved: boolean; toggle: () => void } {
  const { user } = useAuth();
  const userId = user?.id;
  const [saved, setSaved] = useState(() => checkSaved(userId, itemType, itemId));

  useEffect(() => {
    setSaved(checkSaved(userId, itemType, itemId));
    return subscribeFavoritesUpdated(() =>
      setSaved(checkSaved(userId, itemType, itemId))
    );
  }, [userId, itemType, itemId]);

  const toggle = useCallback(() => {
    const next = toggleSavedItem(userId, itemType, itemId);
    setSaved(next);
  }, [userId, itemType, itemId]);

  return { isSaved: saved, toggle };
}
