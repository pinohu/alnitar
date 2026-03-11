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

const proFeatures = [
  "Unlimited scans and cloud journal — your log everywhere",
  "Export your log (PDF, CSV) for your club or records",
  "Session planner — what to look at now, for your gear and time",
  "Verified observations — timestamp and location for clubs and programs",
  "Badges, streaks, shareable sky résumé",
  "Challenges and programs (Messier, seasonal, club-linked)",
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
              <div className="flex items-center gap-2 text-primary font-medium mb-4">
                <Award className="w-5 h-5" />
                Alnitar Pro
              </div>
              <p className="text-3xl font-display font-bold mb-1">$9/mo</p>
              <p className="text-sm text-muted-foreground mb-6">
                Cancel anytime. All Pro features, cloud backup, priority support.
              </p>
              <ul className="space-y-2 mb-6">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
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

          <div className="glass-card p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="font-display font-semibold mb-1">Why Pro?</h2>
              <p className="text-sm text-muted-foreground">
                Pro gives you a permanent, exportable log; a session planner that knows your gear and time; and verified records so your observations count for your club or program.
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
