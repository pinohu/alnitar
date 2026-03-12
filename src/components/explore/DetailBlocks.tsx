/**
 * DetailBlocks — shared hero, facts, tags, and related grids for object/event detail pages.
 */

import { Link } from "react-router-dom";
import { ObjectCard } from "@/components/explore/ObjectCard";
import { EventCard } from "@/components/explore/EventCard";
import type { SeedCelestialObject, SeedAstronomyEvent } from "@/types/astronomy";

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

export function DetailHero({
  eyebrow,
  title,
  subtitle,
  body,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
}) {
  return (
    <section className="glass-card p-8 md:p-12">
      <p className="text-xs uppercase tracking-widest text-primary/80">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      <p className="mt-6 max-w-3xl text-base leading-8 text-foreground/90">{body}</p>
    </section>
  );
}

export function FactGrid({ facts }: { facts: Record<string, string> }) {
  const entries = Object.entries(facts);
  if (!entries.length) return null;
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-semibold">Key facts</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map(([key, value]) => (
          <StatPill key={key} label={key.replaceAll("_", " ")} value={value} />
        ))}
      </div>
    </section>
  );
}

export function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-sm text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function RelatedObjectGrid({ items }: { items: SeedCelestialObject[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-semibold">Related objects</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ObjectCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

export function RelatedEventGrid({ items }: { items: SeedAstronomyEvent[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-semibold">Related events</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <EventCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}
