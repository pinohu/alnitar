// src/hooks/use-page-title.ts — per-route document title, meta description, and optional OG tags for SEO

import { useEffect } from "react";

const DEFAULT_TITLE = "Alnitar — Discover the Night Sky Instantly";
const DEFAULT_DESCRIPTION =
  "Photograph the sky and instantly identify constellations, stars, planets, and deep-sky objects. Alnitar is your intelligent night-sky exploration platform.";
const DEFAULT_OG_TITLE = "Alnitar — Discover the Night Sky";
const DEFAULT_OG_DESCRIPTION = "Take a photo of the sky and instantly discover what you are looking at. Constellations, stars, planets, and more.";

function ensureMeta(nameOrProperty: string, isProperty: boolean): HTMLMetaElement {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, nameOrProperty);
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Sets document.title and optionally the meta name="description" and og:title / og:description for the current route.
 * Call once at the top of a page component. Restores defaults on unmount.
 */
export function usePageTitle(
  title: string,
  description?: string,
  openGraph?: { title?: string; description?: string }
): void {
  useEffect(() => {
    document.title = title ? `${title} | Alnitar` : DEFAULT_TITLE;

    const desc = description !== undefined ? description : undefined;
    if (desc !== undefined) {
      ensureMeta("description", false).content = desc;
    }
    if (openGraph) {
      if (openGraph.title !== undefined) ensureMeta("og:title", true).content = openGraph.title;
      if (openGraph.description !== undefined) ensureMeta("og:description", true).content = openGraph.description;
    }

    return () => {
      document.title = DEFAULT_TITLE;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) (meta as HTMLMetaElement).content = DEFAULT_DESCRIPTION;
      ensureMeta("og:title", true).content = DEFAULT_OG_TITLE;
      ensureMeta("og:description", true).content = DEFAULT_OG_DESCRIPTION;
    };
  }, [title, description, openGraph?.title, openGraph?.description]);
}
