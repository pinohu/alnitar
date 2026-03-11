/**
 * Celestial Explorer — unified search and browse for constellations and deep-sky objects.
 * PRD: object search, filter by type, object detail pages, scientific metadata.
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Globe } from "lucide-react";
import { ConstellationCard } from "@/components/ConstellationCard";
import { searchCelestialObjects, CELESTIAL_OBJECT_KINDS, isConstellationItem, isDSOItem } from "@/lib/celestial-explorer";
import { trackEvent } from "@/lib/analytics";
import { usePageTitle } from "@/hooks/use-page-title";

const ALL_KINDS = "all";

export default function CelestialExplorerPage() {
  usePageTitle(
    "Celestial Explorer",
    "Search and browse constellations, galaxies, nebulae, and clusters. Scientific metadata and observation tips."
  );
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string>(ALL_KINDS);

  const results = useMemo(() => {
    const items = searchCelestialObjects({
      query: query.trim() || undefined,
      kind: kind === ALL_KINDS ? undefined : (kind as "constellation" | "galaxy" | "nebula" | "cluster" | "planetary-nebula" | "supernova-remnant"),
    });
    return items;
  }, [query, kind]);

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
                Celestial <span className="gradient-text">Explorer</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Search and browse constellations, galaxies, nebulae, and clusters. Tap any object for details, visibility, and observation tips.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
              <Input
                placeholder="Search by name or catalog..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-card/60 border-border/40"
                aria-label="Search celestial objects"
              />
            </div>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="w-full sm:w-44 bg-card/60 border-border/40" aria-label="Filter by type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_KINDS}>All types</SelectItem>
                {CELESTIAL_OBJECT_KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {results.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
              <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden />
              <p className="text-muted-foreground">No objects match your search or filter.</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different term or show all types.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((item, i) => {
                if (isConstellationItem(item)) {
                  return (
                    <ConstellationCard key={`c-${item.data.id}`} constellation={item.data} index={i} />
                  );
                }
                if (isDSOItem(item)) {
                  const d = item.data;
                  return (
                    <motion.div
                      key={`dso-${d.id}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/explore/object/dso/${d.id}`}
                        onClick={() => trackEvent("object_viewed", { object_id: d.id, object_type: "dso", source: "explorer" })}
                        className="glass-card-hover block p-5 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-primary" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {d.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {d.catalog} · {d.type.replace("-", " ")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{d.description}</p>
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              <span className="text-xs bg-muted/50 px-2 py-0.5 rounded capitalize">{d.visibility}</span>
                              <span className="text-xs text-muted-foreground">Mag {d.magnitude}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
