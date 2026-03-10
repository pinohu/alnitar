import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { constellations, searchConstellations, getConstellationsByFilter } from "@/data/constellations";
import { ConstellationCard } from "@/components/ConstellationCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const seasons = ["All", "Winter", "Spring", "Summer", "Autumn"];
const hemispheres = ["All", "northern", "southern", "both"];

export default function LearnPage() {
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState("All");
  const [hemisphere, setHemisphere] = useState("All");

  const filtered = useMemo(() => {
    let results = constellations;
    if (query) {
      results = searchConstellations(query);
      trackEvent("search_performed", { query });
    }
    if (season !== "All") {
      results = results.filter(c => c.bestSeason.toLowerCase() === season.toLowerCase());
    }
    if (hemisphere !== "All") {
      results = results.filter(c => c.hemisphere === hemisphere || c.hemisphere === "both");
    }
    return results;
  }, [query, season, hemisphere]);

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Constellation <span className="gradient-text">Library</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Explore {constellations.length} famous constellations — mythology, stars, and spotting tips.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search constellations..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-10 bg-card/60 border-border/40"
              />
            </div>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-full sm:w-36 bg-card/60 border-border/40">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={hemisphere} onValueChange={setHemisphere}>
              <SelectTrigger className="w-full sm:w-40 bg-card/60 border-border/40">
                <SelectValue placeholder="Hemisphere" />
              </SelectTrigger>
              <SelectContent>
                {hemispheres.map(h => (
                  <SelectItem key={h} value={h}>{h === "All" ? "All" : h.charAt(0).toUpperCase() + h.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No constellations match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((c, i) => (
                <ConstellationCard key={c.id} constellation={c} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
