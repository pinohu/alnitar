import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Globe, Clock, Sparkles } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export default function ExplorePage() {
  usePageTitle("Explore", "Solar system and sky. Browse celestial objects, planetarium, and time-travel views.");
  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              3D <span className="gradient-text">Explore</span>
            </h1>
            <p className="text-muted-foreground mb-6">
              Solar system and sky in 3D. Browse celestial objects, planetarium, and time-travel views.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Link to="/objects" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Sparkles className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Object explorer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Planets, stars, constellations, DSOs — filter by type & hemisphere</p>
              </div>
            </Link>
            <Link to="/events/explore" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Sparkles className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Event explorer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Meteor showers, eclipses, observing seasons</p>
              </div>
            </Link>
            <Link to="/explore/catalog" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Sparkles className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Unified catalog</h3>
                <p className="text-xs text-muted-foreground mt-0.5">100+ objects: quick list with search</p>
              </div>
            </Link>
            <Link to="/explore/objects" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Sparkles className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Celestial Explorer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Constellations, galaxies, nebulae, clusters</p>
              </div>
            </Link>
            <Link to="/planetarium" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Globe className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Planetarium</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Interactive 2D star map</p>
              </div>
            </Link>
            <Link to="/time-travel" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Clock className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Time travel</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Scrub through time and see planet orbits</p>
              </div>
            </Link>
            <Link to="/explore/solar-system" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Globe className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Solar system orrery</h3>
                <p className="text-xs text-muted-foreground mt-0.5">2D orbits; 3D WebGL coming next</p>
              </div>
            </Link>
            <Link to="/events/simulate" className="glass-card-hover glass-card p-6 flex items-center gap-4">
              <Clock className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h3 className="font-display font-semibold">Event simulation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Simulate lunar eclipse</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
