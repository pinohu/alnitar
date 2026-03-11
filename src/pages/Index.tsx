import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { StarField } from "@/components/StarField";
import { Upload, Compass, BookOpen, Sparkles, Eye, Moon, Star, ArrowRight, Zap, Cloud, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { constellations } from "@/data/constellations";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { getDiscoveryRecommendations } from "@/lib/discovery";
import { getLocalProgress } from "@/lib/gamification";
import { getUpcomingEvents } from "@/lib/discovery/eventAwareness";
import { getTonightSkyData } from "@/lib/tonight";
import { HomepageDiscovery } from "@/components/DiscoveryPanel";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { trackEvent } from "@/lib/analytics";
import { useGeolocation } from "@/hooks/use-geolocation";
import { usePageTitle } from "@/hooks/use-page-title";

const features: { icon: typeof Eye; title: string; desc: string; to: string }[] = [
  { icon: Eye, title: "Identify in seconds", desc: "Upload a sky photo and see which constellations are in it — with confidence scores and links to learn more. No telescope needed.", to: "/recognize" },
  { icon: Compass, title: "Explore the sky", desc: "Interactive sky map and planetarium. Stars, constellations, planets, and deep-sky objects — all at your fingertips.", to: "/sky" },
  { icon: Sparkles, title: "Deep-sky spotting", desc: "Nebulae, galaxies, and clusters with Messier and NGC info. Know what's visible and how to find it.", to: "/explore/objects" },
  { icon: Star, title: "Your observatory log", desc: "Every observation in one place — searchable and exportable. Build a permanent record that clubs and programs can trust.", to: "/journal" },
  { icon: BookOpen, title: "Tonight, planned for you", desc: "What to look at and when, for your location and gear. So every clear night is time well spent.", to: "/tonight" },
  { icon: Zap, title: "Logs that count", desc: "Verified timestamps and location. Export for your club, school, or citizen science — your hobby can contribute.", to: "/journal" },
];

function getConstellationOfTheNight() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return constellations[day % constellations.length];
}

export default function Index() {
  usePageTitle(
    "Discover the Night Sky",
    "Photograph the sky and instantly identify constellations, stars, planets, and deep-sky objects. Your intelligent night-sky exploration platform."
  );
  const { latitude, longitude } = useGeolocation();
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const tonightSky = useMemo(
    () => getTonightSkyData(now, latitude, longitude),
    [latitude, longitude, dateKey]
  );
  const tonight = tonightSky.bestConstellations[0] ?? getConstellationOfTheNight();

  const discovery = useMemo(() => {
    const progress = getLocalProgress();
    return getDiscoveryRecommendations({
      latitude,
      longitude,
      date: now,
      equipment: "naked-eye",
      experienceLevel: "beginner",
      constellationsFound: progress.constellationsFound,
      dsosObserved: [],
      totalObservations: progress.totalObservations,
    });
  }, [latitude, longitude, dateKey]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(now, 90).slice(0, 3), [dateKey]);

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />

      {/* Hero — cinematic, premium */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" aria-hidden />
        <div className="container max-w-4xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" aria-hidden />
              Identify · Plan · Log — your way
            </motion.div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-balance">
              Your next clear night,
              <br />
              <span className="gradient-text">planned in one place.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed text-pretty">
              Point your camera at the sky and know what you're seeing in seconds. Build a permanent observatory log, get tonight's best targets for your location and gear, and export verified records for your club or programs — no telescope required.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-10">
              Free to try. One account unlocks unlimited scans, cloud journal, and planning that remembers you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-glow text-base font-semibold px-8">
                <Link to="/recognize" onClick={() => trackEvent("cta_click", { location: "hero", cta: "identify_photo" })}>
                  <Upload className="w-5 h-5 mr-2" aria-hidden />Identify a photo — free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base font-semibold px-8 border-border/50 hover:bg-muted/30 hover:border-primary/30">
                <Link to="/tonight" onClick={() => trackEvent("cta_click", { location: "hero", cta: "tonight" })}>
                  <Moon className="w-5 h-5 mr-2" aria-hidden />What's up tonight?
                </Link>
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
                <li>10 sky scans per day</li>
                <li>All 88 constellations — learn and explore</li>
                <li>Tonight's sky score and conditions</li>
                <li>Up to 15 journal entries on this device</li>
                <li>Sky Map, Planetarium, Time Travel</li>
              </ul>
            </div>
            <div className="glass-card p-6 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
                <Cloud className="w-4 h-4" />
                One free account
              </div>
              <p className="text-sm text-foreground/90 mb-3">Unlimited scans and cloud journal when you sign in:</p>
              <ul className="text-sm text-foreground/90 space-y-2">
                <li>Unlimited sky scans</li>
                <li>All 88 constellations — learn and explore</li>
                <li>Tonight's sky score and conditions</li>
                <li>Up to 15 journal entries on this device</li>
                <li>Sky Map, Planetarium, Time Travel</li>
                <li>Progress and badges saved with your account</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">Unlimited scans, cloud journal &amp; export? <Link to="/pricing" className="text-primary hover:underline">See Pro</Link>.</p>
              <Button asChild size="sm" className="mt-4 btn-glow">
                <Link to="/signup">Create free account <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product demo tease */}
      <section className="relative z-10 py-12 px-4">
        <div className="container max-w-2xl text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-muted-foreground text-sm mb-4">
            See it in action
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Button asChild variant="secondary" size="lg" className="border-border/50">
              <Link to="/recognize" onClick={() => trackEvent("cta_click", { location: "demo_tease", cta: "identify" })}>
                Open Cosmic Camera <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Astronomy event showcase */}
      {upcomingEvents.length > 0 && (
        <section className="relative z-10 py-16 px-4 border-y border-border/20">
          <div className="container max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-2 text-accent text-sm font-medium mb-4">
              <Calendar className="w-4 h-4" aria-hidden />
              Upcoming celestial events
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-3">
              {upcomingEvents.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/events/${e.id}`}
                    onClick={() => trackEvent("event_viewed", { event_id: e.id, source: "homepage" })}
                    className="block glass-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors rounded-xl"
                  >
                    <div className="font-display font-semibold text-sm mb-0.5">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.date}</div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-4">
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link to="/events">View all events <ArrowRight className="w-4 h-4 ml-1" aria-hidden /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

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
                {tonight.alternateNames[0] && <p className="text-muted-foreground text-sm mb-3">{tonight.alternateNames[0]}</p>}
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

      {/* Community vision */}
      <section className="relative z-10 py-16 px-4">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8 text-center border-primary/20">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary/80" aria-hidden />
            <h2 className="font-display text-2xl font-bold mb-3">A global community of sky observers</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto mb-6">
              Join observers worldwide: share what you see, take part in sky campaigns and citizen science, and build a log that matters. Alnitar is building the universal platform for the night sky — for everyone from casual stargazers to clubs and institutions.
            </p>
            <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
              <Link to="/campaigns" onClick={() => trackEvent("cta_click", { location: "community_vision", cta: "campaigns" })}>
                Explore campaigns <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
              </Link>
            </Button>
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
          <span className="text-primary/90">Building the universal platform for the night sky</span>
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
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link
                  to={f.to}
                  className="block glass-card p-6 group cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors rounded-xl"
                  onClick={() => trackEvent("cta_click", { location: "features_grid", cta: f.to })}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </Link>
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
                <Link to="/recognize" onClick={() => trackEvent("cta_click", { location: "footer_cta", cta: "identify" })}>
                  Identify a photo <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary/40 text-primary hover:bg-primary/10 text-base font-semibold px-8">
                <Link to="/signup" onClick={() => trackEvent("cta_click", { location: "footer_cta", cta: "signup" })}>
                  Create free account
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
