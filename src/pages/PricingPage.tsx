// src/pages/PricingPage.tsx — Alnitar Pro and pricing (stretched value prop)
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarField } from "@/components/StarField";
import { Check, Star, Award, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const freeFeatures = [
  "Constellation recognition (5 scans/day guest)",
  "Sky Map, Planetarium, Tonight's Sky",
  "Learn — all 88 constellations",
  "Up to 15 journal entries (local)",
  "Progress and badges on this device",
];

const proFeatures = [
  "Unlimited sky life — cloud backup, never lose a log",
  "Export your observatory log (PDF, CSV) for clubs or archive",
  "Expert session planner — what to look at now, with your gear",
  "Verified observations — timestamp + location for clubs and schools",
  "Sky identity — badges, streaks, shareable sky résumé",
  "Challenges and programs (Messier marathon, seasonal, club-linked)",
  "Priority support",
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">Pricing</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your sky life, expert planning, and credibility. The core app stays free forever; Pro is for those who want the full observatory.
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
              <div className="flex items-center gap-2 text-primary font-medium mb-4">
                <Award className="w-5 h-5" />
                Alnitar Pro
              </div>
              <p className="text-3xl font-display font-bold mb-1">Coming soon</p>
              <p className="text-sm text-muted-foreground mb-6">
                Target: $5–15/mo or $50–150/year. Exact pricing when we launch.
              </p>
              <ul className="space-y-2 mb-6">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full btn-glow">
                <a href="mailto:support@alnitar.com?subject=Alnitar%20Pro%20notify%20me">
                  <Mail className="w-4 h-4 mr-2" />
                  Notify me when Pro launches
                </a>
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="font-display font-semibold mb-1">Why Pro?</h2>
              <p className="text-sm text-muted-foreground">
                Sky life = your permanent, searchable observatory log. Expert planning = what to do in the next 90 minutes with your gear. Credibility = verified logs for clubs, schools, and programs.
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
