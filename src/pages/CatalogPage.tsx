/**
 * Unified catalog — browse 100+ seed celestial objects (planets, stars, constellations, DSOs).
 * Uses seed domain layer for discovery and learning.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles } from "lucide-react";
import { getSeedObjects } from "@/lib/seed";
import type { SeedObjectType } from "@/types/astronomy";
import { usePageTitle } from "@/hooks/use-page-title";

const TYPE_LABELS: Record<SeedObjectType | "all", string> = {
  all: "All types",
  star: "Star",
  planet: "Planet",
  "dwarf-planet": "Dwarf planet",
  moon: "Moon",
  constellation: "Constellation",
  galaxy: "Galaxy",
  nebula: "Nebula",
  cluster: "Cluster",
};

export default function CatalogPage() {
  usePageTitle(
    "Unified Catalog",
    "Browse 100+ celestial objects: planets, stars, constellations, and deep-sky objects. Real data for discovery and learning."
  );
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");

  const results = useMemo(() => {
    return getSeedObjects({
      q: query.trim() || undefined,
      type: type === "all" ? undefined : (type as SeedObjectType),
    });
  }, [query, type]);

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" aria-hidden />
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Unified <span className="gradient-text">Catalog</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Planets, stars, constellations, and deep-sky objects in one place. Tap any for summary and facts.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Search by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-card/60 border-border/40"
                aria-label="Search catalog"
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-48 bg-card/60 border-border/40" aria-label="Filter by type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TYPE_LABELS) as [keyof typeof TYPE_LABELS, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {results.length} object{results.length !== 1 ? "s" : ""} found
          </p>

          <ul className="space-y-2">
            {results.map((obj, i) => (
              <motion.li
                key={obj.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
              >
                <Link
                  to={`/object/${obj.id}`}
                  className="glass-card block p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{obj.name_display ?? obj.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{obj.type.replace("-", " ")}</span>
                    {obj.facts?.catalog && (
                      <span className="text-xs text-muted-foreground">{obj.facts.catalog}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{obj.summary}</p>
                </Link>
              </motion.li>
            ))}
          </ul>

          {results.length === 0 && (
            <p className="text-muted-foreground text-center py-12">No objects match your search. Try a different filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
