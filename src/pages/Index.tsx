import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { Upload, Compass, BookOpen, Sparkles, Eye, Moon, Star, ArrowRight, Zap, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { constellations } from "@/data/constellations";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { getDiscoveryRecommendations } from "@/lib/discovery";
import { getLocalProgress } from "@/lib/gamification";
import { HomepageDiscovery } from "@/components/DiscoveryPanel";
import { Footer } from "@/components/Footer";
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
              The sky in your pocket
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Point at the sky.
              <br />
              <span className="gradient-text">Know what you're looking at.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              Upload a photo or point your phone — identify constellations, stars, and deep-sky objects in seconds. No telescope required.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-10">
              Join stargazers worldwide. Try free — no signup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-glow text-base font-semibold px-8">
                <Link to="/recognize"><Upload className="w-5 h-5 mr-2" />Try it now — free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base font-semibold px-8 border-border/50 hover:bg-muted/30">
                <Link to="/sky"><Compass className="w-5 h-5 mr-2" />Explore the Sky</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Free vs Registered value — generous free, eager to join */}
      <section className="relative z-10 py-12 px-4 border-y border-border/20">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
                <Zap className="w-4 h-4" />
                Start free — no signup
              </div>
              <p className="text-sm text-muted-foreground mb-3">Everything you need to fall in love with the night sky:</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>5 sky scans per day</li>
                <li>Full constellation library — all 88</li>
                <li>Tonight's sky score, moon, visibility</li>
                <li>Up to 15 journal entries (saved on this device)</li>
                <li>Sky Map, Planetarium, Time Travel, Learn</li>
              </ul>
            </div>
            <div className="glass-card p-6 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
                <Cloud className="w-4 h-4" />
                Join the community — free account
              </div>
              <p className="text-sm text-foreground/90 mb-3">When you're ready for more:</p>
              <ul className="text-sm text-foreground/90 space-y-2">
                <li><strong>Unlimited</strong> sky scans</li>
                <li><strong>Unlimited</strong> journal + cloud sync</li>
                <li>Save to the global sky network</li>
                <li>Progress & badges on every device</li>
                <li>Tonight tailored to your location & history</li>
              </ul>
              <Button asChild size="sm" className="mt-4 btn-glow">
                <Link to="/signup">Create free account <ArrowRight className="w-4 h-4 ml-1" /></Link>
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

      {/* Social proof / trust */}
      <section className="relative z-10 py-8 px-4">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="container max-w-3xl flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground/90">88 constellations</span>
          <span>Identify in seconds</span>
          <span>No telescope needed</span>
          <span>Works with any sky photo</span>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-16 px-4">
        <div className="container max-w-5xl">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-3xl font-bold text-center mb-4">
            The most useful stargazing app in your pocket
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From your first "what's that star?" to a full observation journal — all in one place.
          </motion.p>
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
            <h2 className="font-display text-3xl font-bold mb-4">Your next clear night starts here</h2>
            <p className="text-muted-foreground mb-6">Point at the sky and discover. Free to try — create an account when you're ready for unlimited.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="btn-glow text-base font-semibold px-8">
                <Link to="/recognize">Try it free <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary/40 text-primary hover:bg-primary/10 text-base font-semibold px-8">
                <Link to="/signup">Create free account</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
