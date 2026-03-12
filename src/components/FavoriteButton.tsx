/**
 * FavoriteButton — save/unsave object or event. Tracks analytics; wire onToggle to adapter when persistence exists.
 * Extension point for FR-5 (Save/Favorite). SavedItem type: src/types/domain.ts.
 */

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { SavedItem } from "@/types/domain";

type ItemType = SavedItem["itemType"];

export interface FavoriteButtonProps {
  itemType: ItemType;
  itemId: string;
  /** When true, show filled heart and "Saved"; when false, show outline and "Save". */
  isSaved?: boolean;
  /** Called after click; wire to adapter to persist. When absent, only analytics fire. */
  onToggle?: (saved: boolean) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function FavoriteButton({
  itemType,
  itemId,
  isSaved = false,
  onToggle,
  variant = "outline",
  size = "sm",
  className,
}: FavoriteButtonProps) {
  const handleClick = () => {
    const nextSaved = !isSaved;
    trackEvent("save_favorite", {
      itemType,
      itemId,
      action: nextSaved ? "save" : "unsave",
    });
    onToggle?.(nextSaved);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-4 h-4 mr-1.5 ${isSaved ? "fill-current" : ""}`}
        aria-hidden
      />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
