// src/pages/SupportPage.tsx
import { Link } from "react-router-dom";
import { Heart, Mail, BookOpen, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <h1 className="font-display text-3xl font-bold mb-2">Support Alnitar</h1>
          <p className="text-muted-foreground mb-8">
            Alnitar is your sky life, expert planning, and credibility in one place. We stay free for everyone; these are optional ways to help keep it that way.
          </p>

          <div className="flex flex-col gap-6">
            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-primary" aria-hidden />
                <h2 className="font-display text-lg font-semibold">Donate or tip</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                One-time or monthly support goes directly to development and hosting. Every bit helps.
              </p>
              <a
                href="mailto:support@alnitar.com?subject=Support%20Alnitar"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <Mail className="w-4 h-4" />
                Get in touch to support
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                (Ko-fi, Patreon, or other links can be added here when you set them up.)
              </p>
            </section>

            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-primary" aria-hidden />
                <h2 className="font-display text-lg font-semibold">Spread the word</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Tell friends, share on social media, or leave a review. More users mean we can invest more in Alnitar.
              </p>
            </section>

            <section className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-primary" aria-hidden />
                <h2 className="font-display text-lg font-semibold">Alnitar Pro (coming later)</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Optional paid tier: unlimited sky life (cloud, export, backup), expert session planner, verified logs for clubs and schools, and sky identity (badges, challenges). The core app stays free.
              </p>
              <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring rounded">
                See pricing and roadmap →
              </Link>
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
