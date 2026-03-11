// src/hooks/use-page-title.ts — per-route document title and meta description for SEO

import { useEffect } from "react";

const DEFAULT_TITLE = "Alnitar — Discover the Night Sky Instantly";
const DEFAULT_DESCRIPTION =
  "Photograph the sky and instantly identify constellations, stars, planets, and deep-sky objects. Alnitar is your intelligent night-sky exploration platform.";

/**
 * Sets document.title and optionally the meta name="description" for the current route.
 * Call once at the top of a page component. Restores default on unmount.
 */
export function usePageTitle(title: string, description?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | Alnitar` : DEFAULT_TITLE;

    if (description !== undefined) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    return () => {
      document.title = DEFAULT_TITLE;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) (meta as HTMLMetaElement).content = DEFAULT_DESCRIPTION;
    };
  }, [title, description]);
}
