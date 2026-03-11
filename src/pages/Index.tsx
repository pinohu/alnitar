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
  { icon: Eye, title: "Identify in seconds", desc: "Upload a sky photo and see which constellations are in it — with confidence scores and links to learn more. No telescope needed." },
  { icon: Compass, title: "Explore the sky", desc: "Interactive sky map and planetarium. Stars, constellations, planets, and deep-sky objects — all at your fingertips." },
  { icon: Sparkles, title: "Deep-sky spotting", desc: "Nebulae, galaxies, and clusters with Messier and NGC info. Know what's visible and how to find it." },
  { icon: Star, title: "Your observatory log", desc: "Every observation in one place — searchable and exportable. Build a permanent record that clubs and programs can trust." },
  { icon: BookOpen, title: "Tonight, planned for you", desc: "What to look at and when, for your location and gear. So every clear night is time well spent." },
  { icon: Zap, title: "Logs that count", desc: "Verified timestamps and location. Export for your club, school, or citizen science — your hobby can contribute." },
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
              Identify · Plan · Log — your way
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Your next clear night,
              <br />
              <span className="gradient-text">planned in one place.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              Point your camera at the sky and know what you're seeing in seconds. Build a permanent observatory log, get tonight's best targets for your location and gear, and export verified records for your club or programs — no telescope required.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-10">
              Free to try. One account unlocks unlimited scans, cloud journal, and planning that remembers you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-glow text-base font-semibold px-8">
                <Link to="/recognize"><Upload className="w-5 h-5 mr-2" />Identify a photo — free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base font-semibold px-8 border-border/50 hover:bg-muted/30">
                <Link to="/tonight"><Moon className="w-5 h-5 mr-2" />What's up tonight?</Link>
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
                Try first — no signup
              </div>
              <p className="text-sm text-muted-foreground mb-3">See what Alnitar can do for you:</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>5 sky scans per day</li>
                <li>All 88 constellations — learn and explore</li>
                <li>Tonight's sky score and conditions</li>
                <li>Up to 15 journal entries on this device</li>
                <li>Sky Map, Planetarium, Time Travel</li>
              </ul>
            </div>
            <div className="glass-card p-6 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
                <Cloud className="w-4 h-4" />
                One free account — your sky, everywhere
              </div>
              <p className="text-sm text-foreground/90 mb-3">When you're ready to keep everything:</p>
              <ul className="text-sm text-foreground/90 space-y-2">
                <li><strong>Unlimited</strong> sky scans</li>
                <li><strong>Unlimited</strong> journal with cloud backup</li>
                <li>Tonight tailored to your location and what you've already found</li>
                <li>Progress and badges on every device</li>
                <li>Export-ready logs for clubs and programs</li>
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
          <span>Your location, your gear</span>
          <span>No telescope required</span>
          <span>Export for clubs & programs</span>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-16 px-4">
        <div className="container max-w-5xl">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="font-display text-3xl font-bold text-center mb-4">
            Everything you need — identify, plan, log
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From "what's that star?" to a permanent log you can export for your club or program. We make the path simple so you can focus on the sky.
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
            <p className="text-muted-foreground mb-6">Identify what you see, plan tonight in one place, and keep a log that matters. Free to try — one account gives you unlimited scans and a journal that follows you everywhere.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="btn-glow text-base font-semibold px-8">
                <Link to="/recognize">Identify a photo <ArrowRight className="w-5 h-5 ml-2" /></Link>
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
