/**
 * Object explorer — list seed celestial objects with URL-driven filters; links to /objects/:slug.
 */

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { ObjectCard } from "@/components/explore/ObjectCard";
import { ObjectFilters } from "@/components/explore/ObjectFilters";
import { EmptyState } from "@/components/explore/EmptyState";
import { getSeedObjects } from "@/lib/seed";
import type { SeedObjectType, Hemisphere } from "@/types/astronomy";
import { usePageTitle } from "@/hooks/use-page-title";

export default function ObjectExplorerPage() {
  usePageTitle(
    "Celestial Objects",
    "Browse planets, stars, constellations, nebulae, galaxies, and clusters. Discovery-first explorer."
  );
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const hemisphere = searchParams.get("hemisphere") ?? "";
  const tag = searchParams.get("tag") ?? "";

  const results = useMemo(
    () =>
      getSeedObjects({
        q: q.trim() || undefined,
        type: (type as SeedObjectType) || undefined,
        hemisphere: (hemisphere as Hemisphere) || undefined,
        tag: tag.trim() || undefined,
      }),
    [q, type, hemisphere, tag]
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
            className="glass-card mb-8 p-8 md:p-12"
          >
            <p className="text-xs uppercase tracking-widest text-primary/80">Celestial explorer</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Browse celestial objects
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Search planets, stars, constellations, nebulae, galaxies, clusters, and moons. Discovery-first interface for Alnitar.
            </p>
          </motion.section>

          <ObjectFilters />

          <p className="mt-4 text-sm text-muted-foreground">
            {results.length} object{results.length !== 1 ? "s" : ""} found
          </p>

          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.25) }}
              >
                <ObjectCard item={item} />
              </motion.div>
            ))}
          </section>

          {results.length === 0 && (
            <EmptyState
              title="No objects matched your filters"
              body="Try removing a filter, switching hemispheres, or searching for a broader term like Orion, Jupiter, galaxy, or nebula."
              href="/objects"
              cta="Reset filters"
            />
          )}
        </div>
      </div>
    </div>
  );
}
