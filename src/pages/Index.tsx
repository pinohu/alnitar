import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { Upload, Compass, BookOpen, Sparkles, Eye, Moon, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { constellations } from "@/data/constellations";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { getDiscoveryRecommendations } from "@/lib/discovery";
import { getLocalProgress } from "@/lib/gamification";
import { HomepageDiscovery } from "@/components/DiscoveryPanel";
import { Navbar } from "@/components/Navbar";

const features = [
  { icon: Eye, title: "Constellation Recognition", desc: "Upload a sky photo and instantly identify constellations with pattern matching and confidence scores." },
  { icon: Compass, title: "Sky Simulator", desc: "Interactive planetarium and sky map. Explore stars, constellations, planets, and deep-sky objects." },
  { icon: Sparkles, title: "Deep Sky Detection", desc: "Detect nebulae, galaxies, and clusters. Messier and NGC catalogs with visibility and spotting tips." },
  { icon: Star, title: "Observation Journal", desc: "Log dates, locations, conditions, and objects observed. Build your personal stargazing history." },
  { icon: BookOpen, title: "AI Astronomy Tutor", desc: "Learn constellations, star brightness, and celestial coordinates with guided lessons and recommendations." },
];

function getConstellationOfTheNight() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return constellations[day % constellations.length];
}

export default function Index() {
  const tonight = getConstellationOfTheNight();

  const discovery = useMemo(() => {
    const progress = getLocalProgress();
    return getDiscoveryRecommendations({
      latitude: 40,
      longitude: 0,
      date: new Date(),
      equipment: 'naked-eye',
      experienceLevel: 'beginner',
      constellationsFound: progress.constellationsFound,
      dsosObserved: [],
      totalObservations: progress.totalObservations,
    });
  }, []);

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Intelligent night-sky exploration
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Discover the night sky
              <br />
              <span className="gradient-text">instantly.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload a sky photo and identify stars, constellations, and galaxies in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-glow text-base font-semibold px-8">
                <Link to="/recognize"><Upload className="w-5 h-5 mr-2" />Upload Sky Photo</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base font-semibold px-8 border-border/50 hover:bg-muted/30">
                <Link to="/sky"><Compass className="w-5 h-5 mr-2" />Explore the Sky</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Discovery Recommendations */}
      <section className="relative z-10 py-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 sm:p-8">
            <HomepageDiscovery result={discovery} />
          </motion.div>
        </div>
      </section>

      {/* Constellation of the Night */}
      <section className="relative z-10 py-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-2 text-accent text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Constellation of the Night
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="shrink-0 rounded-xl bg-muted/20 p-2">
                <ConstellationDiagram constellation={tonight} width={160} height={160} showLabels animated />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-2xl font-bold mb-1">{tonight.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{tonight.alternateNames[0]}</p>
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mb-4">
                  {tonight.mythology.slice(0, 200)}…
                </p>
                <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                  <Link to={`/learn/${tonight.slug}`}>Learn more <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-16 px-4">
        <div className="container max-w-5xl">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-3xl font-bold text-center mb-12">
            Everything you need to explore the cosmos
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card p-6 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="container max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold mb-4">Ready to explore?</h2>
            <p className="text-muted-foreground mb-8">Start identifying constellations from your sky tonight.</p>
            <Button asChild size="lg" className="btn-glow text-base font-semibold px-8">
              <Link to="/recognize">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span>© {new Date().getFullYear()} Alnitar. All rights reserved.</span>
            <span>Developed by ToriMedia, Obuke LLC Series 10 · 924 W 23rd St., Erie, PA 16502</span>
            <a href="mailto:support@alnitar.com" className="hover:text-foreground transition-colors">support@alnitar.com</a>
          </div>
          <div className="flex gap-6">
            <Link to="/learn" className="hover:text-foreground transition-colors">Learn</Link>
            <Link to="/sky" className="hover:text-foreground transition-colors">Sky Map</Link>
            <Link to="/journal" className="hover:text-foreground transition-colors">Journal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
