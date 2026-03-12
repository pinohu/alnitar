/**
 * EventCard — card for a seed astronomy event; links to /events/:slug.
 */

import { Link } from "react-router-dom";
import type { SeedAstronomyEvent } from "@/types/astronomy";

interface EventCardProps {
  item: SeedAstronomyEvent;
}

export function EventCard({ item }: EventCardProps) {
  return (
    <Link
      to={`/events/explore/${item.slug}`}
      className="glass-card-hover glass-card block border-violet-500/10 p-5 transition-colors hover:border-violet-500/30"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-violet-400/80">{item.type.replace("-", " ")}</p>
          <h3 className="mt-1 font-display text-xl font-semibold">{item.name}</h3>
        </div>
        <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300 capitalize">
          {item.bestFor}
        </span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">{item.recurrence}</p>
      <p className="text-sm font-medium text-amber-200/90">Peak: {item.peakWindow}</p>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground/90">{item.summary}</p>
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
