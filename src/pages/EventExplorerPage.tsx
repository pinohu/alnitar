/**
 * Event explorer — list seed astronomy events with URL-driven filters; links to /events/:slug.
 */

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { EventCard } from "@/components/explore/EventCard";
import { EventFilters } from "@/components/explore/EventFilters";
import { EmptyState } from "@/components/explore/EmptyState";
import { getSeedEvents } from "@/lib/seed";
import type { SeedEventType } from "@/types/astronomy";
import { usePageTitle } from "@/hooks/use-page-title";

export default function EventExplorerPage() {
  usePageTitle(
    "Astronomy Events",
    "Meteor showers, eclipses, planetary milestones, observing seasons. Recurring skywatching opportunities."
  );
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const bestFor = searchParams.get("bestFor") ?? "";

  const results = useMemo(
    () =>
      getSeedEvents({
        q: q.trim() || undefined,
        type: (type as SeedEventType) || undefined,
        bestFor: bestFor.trim() || undefined,
      }),
    [q, type, bestFor]
  );

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-6xl">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-8 border-violet-500/10 p-8 md:p-12"
          >
            <p className="text-xs uppercase tracking-widest text-violet-400/80">Sky calendar</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Explore astronomy events
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Meteor showers, eclipses, planetary milestones, lunar phases, observing seasons, and other recurring skywatching opportunities.
            </p>
          </motion.section>

          <EventFilters />

          <p className="mt-4 text-sm text-muted-foreground">
            {results.length} event{results.length !== 1 ? "s" : ""} found
          </p>

          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.25) }}
              >
                <EventCard item={item} />
              </motion.div>
            ))}
          </section>

          {results.length === 0 && (
            <EmptyState
              title="No events matched your filters"
              body="Try removing a filter or searching for broader terms like eclipse, meteor, conjunction, or lunar."
              href="/events/explore"
              cta="Reset filters"
            />
          )}
        </div>
      </div>
    </div>
  );
}
