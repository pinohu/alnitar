// src/pages/PricingPage.tsx — Alnitar Pro and pricing (stretched value prop)
import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarField } from "@/components/StarField";
import { Check, Star, Award, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isCloudflareConfigured, cfFetch } from "@/integrations/cloudflare/client";
import { isPro } from "@/lib/featureAccess";
import { toast } from "sonner";

const freeFeatures = [
  "Constellation recognition (5 scans/day without account)",
  "Sky Map, Planetarium, Tonight's Sky",
  "Learn — all 88 constellations",
  "Up to 15 journal entries on this device",
  "Progress and badges here",
];

/** Pro value stacking: pillars and sub-bullets so the full value of Pro is clear from the copy. */
const proValueStacks = [
  {
    title: "1. Unlimited use & cloud journal",
    desc: "No daily scan limits. Your observatory log syncs across every device — phone, tablet, desktop — so you never lose an observation.",
    bullets: ["Unlimited constellation recognition scans", "Unlimited journal entries", "Cloud backup and sync everywhere", "Progress and badges follow you"],
  },
  {
    title: "2. Export & reporting",
    desc: "Turn your log into reports that clubs, programs, and records accept. Export once or on a schedule.",
    bullets: ["PDF export for printing and submission", "CSV export for spreadsheets and clubs", "JSON with verification payload for science", "Year in Review printable summary"],
  },
  {
    title: "3. Session planner",
    desc: "Get a ranked list of what to look at tonight based on your location, equipment, and time window. No more guessing.",
    bullets: ["Filter by naked eye, binoculars, or telescope", "Choose time window (e.g. next 90 min, 8–10 PM)", "Personalized to what you’ve already found", "Difficulty and best viewing time per target"],
  },
  {
    title: "4. Verified observations",
    desc: "Every entry can include timestamp and location so it counts for club programs, certifications, and citizen science.",
    bullets: ["Verified timestamp on each observation", "Location stored for credibility", "Verification payload for export", "Trusted by clubs and educators"],
  },
  {
    title: "5. Year in Review & observation certificate",
    desc: "Annual stats at a glance plus a printable observation certificate you can share or frame.",
    bullets: ["Year in Review: observations, constellations, first/last date", "Print or copy summary for sharing", "Observation certificate (Pro): printable one-pager for the year", "Perfect for clubs, social, or personal records"],
  },
  {
    title: "6. Recognition, challenges & programs",
    desc: "Badges, streaks, a shareable sky résumé, and structured challenges and observing programs to keep you growing.",
    bullets: ["Badges and streak tracking", "Shareable sky résumé (one-tap share)", "Challenges (e.g. Winter DSO)", "Observing programs (First 10 Constellations, Messier starters, Winter Six)", "Priority support via email"],
  },
];

/** Full Pro feature list for the expanded section. */
const proFeatureList = [
  "Unlimited sky scans",
  "Unlimited journal entries with cloud sync",
  "PDF, CSV & JSON export",
  "Session planner (equipment, time, goal)",
  "Verified observations (timestamp + location)",
  "Year in Review with stats & summary",
  "Observation certificate (printable)",
  "Shareable sky résumé",
  "Badges & streaks across devices",
  "Challenges (seasonal, DSO, constellation)",
  "Observing programs (First 10, Messier, Winter Six)",
  "Priority support",
];

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const canUpgrade = isCloudflareConfigured && user && !isPro(user);

  const handleUpgrade = async () => {
    if (!user || !canUpgrade) return;
    setLoading(true);
    try {
      const res = await cfFetch("api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || data.error) {
        toast.error(data.error || "Could not start checkout");
        return;
      }
      if (data.url) window.location.href = data.url;
      else toast.error("No checkout URL");
    } catch {
      toast.error("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">Pricing</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Identify, plan, and log for free. Pro adds exports, session planning, and verified logs so your observations count for clubs and programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 text-muted-foreground font-medium mb-4">
                <Star className="w-5 h-5" />
                Free
              </div>
              <p className="text-3xl font-display font-bold mb-1">$0</p>
              <p className="text-sm text-muted-foreground mb-6">Forever. No credit card.</p>
              <ul className="space-y-2 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full border-border/50">
                <Link to="/signup">Create free account</Link>
              </Button>
            </div>

            <div className="glass-card p-6 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-medium mb-2">
                <Award className="w-5 h-5" />
                Alnitar Pro
              </div>
              <p className="text-3xl font-display font-bold mb-1">$9/mo</p>
              <p className="text-sm text-muted-foreground mb-6">
                Cancel anytime. Your full observatory: unlimited use everywhere, professional exports, session planning that fits your gear and time, verified observations that count for clubs and programs, Year in Review with a printable certificate, and recognition, challenges, and observing programs — all in one place.
              </p>
              <div className="space-y-4 mb-6 max-h-[420px] overflow-y-auto pr-1">
                {proValueStacks.map((stack) => (
                  <div key={stack.title}>
                    <p className="text-xs font-semibold text-primary mb-0.5">{stack.title}</p>
                    <p className="text-sm text-muted-foreground">{stack.desc}</p>
                    {stack.bullets && (
                      <ul className="mt-1.5 ml-3 space-y-0.5 text-xs text-muted-foreground list-disc">
                        {stack.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              {canUpgrade ? (
                <Button className="w-full btn-glow" onClick={handleUpgrade} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Upgrade to Pro
                </Button>
              ) : isPro(user ?? null) ? (
                <p className="text-sm text-primary font-medium">You have Pro</p>
              ) : (
                <Button asChild variant="outline" className="w-full border-border/50">
                  <Link to="/login">Sign in to upgrade</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="glass-card p-6 mb-8">
            <h2 className="font-display font-semibold mb-3">Complete Pro feature set</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Everything included with Alnitar Pro — no hidden limits.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {proFeatureList.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="font-display font-semibold mb-1">Why Pro?</h2>
              <p className="text-sm text-muted-foreground">
                Pro turns your hobby into a permanent, credible record: unlimited scans and a journal that syncs everywhere, exports that clubs and programs accept, a session planner that tells you exactly what to look at tonight, verified timestamps and location on every observation, a Year in Review and printable certificate to share or keep, and badges, challenges, and observing programs so your progress never stands still.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to="/">Back to home</Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            <Link to="/support" className="hover:text-foreground transition-colors">Support Alnitar</Link>
            {" · "}
            <Link to="/partners" className="hover:text-foreground transition-colors">For organizations</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
