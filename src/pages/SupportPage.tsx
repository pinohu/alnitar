// src/pages/SupportPage.tsx — Donate (Ko-fi/Patreon), spread the word (share, review), Pro
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, BookOpen, Star, Share2, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const appUrl = (typeof import.meta.env.VITE_APP_URL === "string" && import.meta.env.VITE_APP_URL) || (typeof window !== "undefined" ? window.location.origin : "https://alnitar.com");
const kofiUrl = typeof import.meta.env.VITE_KOFI_URL === "string" ? import.meta.env.VITE_KOFI_URL.trim() : "";
const patreonUrl = typeof import.meta.env.VITE_PATREON_URL === "string" ? import.meta.env.VITE_PATREON_URL.trim() : "";
const storeReviewUrl = typeof import.meta.env.VITE_STORE_REVIEW_URL === "string" ? import.meta.env.VITE_STORE_REVIEW_URL.trim() : "";

export default function SupportPage() {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    const text = "Alnitar — identify, plan, and log your nights under the sky. Your observatory in your pocket.";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Alnitar",
          text,
          url: appUrl,
        });
        toast.success("Thanks for sharing!");
      } else {
        await navigator.clipboard.writeText(`${text}\n${appUrl}`);
        toast.success("Link copied to clipboard");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        await navigator.clipboard.writeText(appUrl).then(() => toast.success("Link copied to clipboard")).catch(() => toast.error("Could not copy"));
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <h1 className="font-display text-3xl font-bold mb-2">Support Alnitar</h1>
          <p className="text-muted-foreground mb-8">
            Alnitar helps you identify, plan, and log your nights under the sky. The core app stays free for everyone; here are ways you can help keep it that way.
          </p>

          <div className="flex flex-col gap-6">
            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-primary" aria-hidden />
                <h2 className="font-display text-lg font-semibold">Donate or tip</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                One-time or monthly support goes straight to development and hosting. Every bit helps us keep Alnitar free and improving.
              </p>
              <div className="flex flex-wrap gap-2">
                {kofiUrl && (
                  <Button asChild size="sm" className="btn-glow">
                    <a href={kofiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Support on Ko-fi
                    </a>
                  </Button>
                )}
                {patreonUrl && (
                  <Button asChild size="sm" variant="outline" className="border-border/50">
                    <a href={patreonUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Patreon
                    </a>
                  </Button>
                )}
                <a
                  href="mailto:support@alnitar.com?subject=Support%20Alnitar"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <Mail className="w-4 h-4" />
                  Contact us to support
                </a>
              </div>
              {!kofiUrl && !patreonUrl && (
                <p className="text-xs text-muted-foreground mt-2">
                  Set VITE_KOFI_URL and/or VITE_PATREON_URL in .env to show Ko-fi or Patreon buttons here.
                </p>
              )}
            </section>

            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-primary" aria-hidden />
                <h2 className="font-display text-lg font-semibold">Spread the word</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tell other stargazers, share on social, or leave a review. More users help us invest more in the tools you use.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="btn-glow" onClick={handleShare} disabled={sharing}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {sharing ? "Sharing…" : "Share Alnitar"}
                </Button>
                {storeReviewUrl && (
                  <Button asChild size="sm" variant="outline" className="border-border/50">
                    <a href={storeReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Leave a review
                    </a>
                  </Button>
                )}
              </div>
              {!storeReviewUrl && (
                <p className="text-xs text-muted-foreground mt-2">
                  Set VITE_STORE_REVIEW_URL in .env to add a “Leave a review” link (e.g. App Store or Play Store).
                </p>
              )}
            </section>

            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-primary" aria-hidden />
                <h2 className="font-display text-lg font-semibold">Alnitar Pro</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Pro adds unlimited cloud journal, PDF/CSV export, session planner, year in review, shareable résumé, challenges and programs, and priority support. The core app stays free.
              </p>
              <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring rounded">
                View pricing →
              </Link>
              <p className="text-xs text-muted-foreground mt-2">
                Pro users: <a href="mailto:support@alnitar.com?subject=Pro%20Priority%20Support" className="text-primary hover:underline">Pro priority support</a>
              </p>
            </section>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            <Link to="/" className="hover:text-foreground transition-colors">Back to home</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
