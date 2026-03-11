import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Globe, Clock } from "lucide-react";

export default function ExplorePage() {
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
              Solar system and sky in 3D. Use the planetarium and time-travel views for interactive 2D; full 3D WebGL scene coming next.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 glass-card p-6 text-center text-muted-foreground text-sm"
          >
            <p>Full 3D galaxy and solar system view (WebGL) will appear here in a future update.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
