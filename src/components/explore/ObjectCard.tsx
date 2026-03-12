/**
 * ObjectCard — card for a seed celestial object; links to /objects/:slug.
 */

import { Link } from "react-router-dom";
import type { SeedCelestialObject } from "@/types/astronomy";

interface ObjectCardProps {
  item: SeedCelestialObject;
}

export function ObjectCard({ item }: ObjectCardProps) {
  const displayName = item.name_display ?? item.name;
  return (
    <Link
      to={`/objects/${item.slug}`}
      className="glass-card-hover glass-card block p-5 transition-colors"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary/80">{item.type.replace("-", " ")}</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{displayName}</h3>
        </div>
        <span className="rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground capitalize">
          {item.hemisphere}
        </span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">{item.subtype}</p>
      <p className="line-clamp-3 text-sm leading-6 text-foreground/90">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
