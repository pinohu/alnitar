// src/pages/YearInReviewPage.tsx — Sky year in review: stats, print, copy summary (Pro)
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { getJournalEntries } from "@/lib/journal";
import { JournalService } from "@/lib/services/journalService";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessProFeatures, hasProCloudBackup } from "@/lib/featureAccess";
import { ProGate } from "@/components/ProGate";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const currentYear = new Date().getFullYear();

export default function YearInReviewPage() {
  const { user } = useAuth();
  const [year, setYear] = useState(currentYear);
  const [entries, setEntries] = useState<ReturnType<typeof getJournalEntries>>([]);
  useEffect(() => {
    if (user && hasProCloudBackup(user)) {
      JournalService.getEntries(user.id).then(setEntries);
    } else {
      setEntries(getJournalEntries());
    }
  }, [user]);

  if (!canAccessProFeatures(user)) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4">
          <div className="container max-w-2xl">
            <Link to="/journal" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">← Back to Journal</Link>
            <ProGate title="Year in Review" description="Your sky stats for the year, print or copy to share. Part of Alnitar Pro." />
          </div>
        </div>
      </div>
    );
  }

  const yearEntries = useMemo(
    () => entries.filter((e) => e.date.startsWith(String(year))),
    [entries, year]
  );

  const stats = useMemo(() => {
    const dates = yearEntries.map((e) => e.date).filter(Boolean);
    const constellations = new Set(yearEntries.map((e) => e.constellationId));
    return {
      total: yearEntries.length,
      constellations: constellations.size,
      firstDate: dates.length ? dates.sort()[0] : null,
      lastDate: dates.length ? dates.sort()[dates.length - 1] : null,
    };
  }, [yearEntries]);

  const summaryText = useMemo(() => {
    const lines = [
      `My ${year} sky — Alnitar Year in Review`,
      ``,
      `Observations: ${stats.total}`,
      `Constellations seen: ${stats.constellations}`,
      stats.firstDate ? `First observation: ${stats.firstDate}` : null,
      stats.lastDate ? `Last observation: ${stats.lastDate}` : null,
      ``,
      `Build your own at alnitar.com`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [year, stats]);

  const handlePrint = () => {
    window.print();
  };

  const displayName = (user?.user_metadata as { name?: string } | undefined)?.name || user?.email || "Observer";

  const handlePrintCertificate = () => {
    document.body.classList.add("printing-certificate");
    window.print();
    const remove = () => {
      document.body.classList.remove("printing-certificate");
      window.removeEventListener("afterprint", remove);
    };
    window.addEventListener("afterprint", remove);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      toast.success("Summary copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  const yearsAvailable = useMemo(() => {
    const set = new Set(entries.map((e) => e.date.slice(0, 4)));
    if (!set.has(String(currentYear))) set.add(String(currentYear));
    return Array.from(set, Number).sort((a, b) => b - a);
  }, [entries]);

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4 print:pt-6">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="print:animate-none">
            <Link to="/journal" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
              ← Back to Journal
            </Link>
            <h1 className="font-display text-3xl font-bold mb-2">
              <span className="gradient-text">{year}</span> in review
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Your sky stats for the year. Print or copy to share.
            </p>

            <div className="glass-card p-6 mb-6 print:border print:shadow-none">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full max-w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm mb-6 print:hidden"
              >
                {yearsAvailable.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {yearEntries.length === 0 ? (
                <p className="text-muted-foreground text-sm">No observations for {year}. Start logging in your <Link to="/journal" className="text-primary hover:underline">Journal</Link>.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-display font-bold text-primary">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Observations</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-primary">{stats.constellations}</p>
                      <p className="text-xs text-muted-foreground">Constellations</p>
                    </div>
                    {stats.firstDate && (
                      <div>
                        <p className="text-sm font-medium">{stats.firstDate}</p>
                        <p className="text-xs text-muted-foreground">First observation</p>
                      </div>
                    )}
                    {stats.lastDate && (
                      <div>
                        <p className="text-sm font-medium">{stats.lastDate}</p>
                        <p className="text-xs text-muted-foreground">Last observation</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 no-print">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print / PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrintCertificate}>
                      <Award className="w-4 h-4 mr-2" />
                      Print certificate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy summary
                    </Button>
                  </div>
                </>
              )}
            </div>

            {yearEntries.length > 0 && (
              <div className="text-sm text-muted-foreground print:text-xs">
                <p className="font-medium text-foreground mb-1">Summary (for sharing)</p>
                <pre className="whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border border-border/50">{summaryText}</pre>
              </div>
            )}

            {/* Observation certificate: visible only when printing (print-certificate mode) */}
            {yearEntries.length > 0 && (
              <div
                id="observation-certificate"
                className="observation-certificate hidden"
              >
                <div className="border-2 border-primary/40 rounded-xl p-8 max-w-lg text-center print:border-primary/60">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Observation Certificate</p>
                  <h2 className="font-display text-2xl font-bold mb-1">Alnitar</h2>
                  <p className="text-sm text-muted-foreground mb-6">Sky observation record</p>
                  <p className="text-lg font-medium text-foreground mb-2">This certifies that</p>
                  <p className="text-xl font-display font-bold text-primary mb-6">{displayName}</p>
                  <p className="text-sm text-foreground mb-4">
                    recorded <strong>{stats.total}</strong> observation{stats.total !== 1 ? "s" : ""} across <strong>{stats.constellations}</strong> constellation{stats.constellations !== 1 ? "s" : ""} in the year <strong>{year}</strong>.
                  </p>
                  {stats.firstDate && stats.lastDate && (
                    <p className="text-xs text-muted-foreground mb-6">
                      First observation: {stats.firstDate} · Last observation: {stats.lastDate}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">alnitar.com · Verified observatory log</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <style>{`
        @media print {
          .no-print, .no-print * { display: none !important; }
        }
        /* When printing, show only the certificate if it's the certificate print flow. We use a dedicated class so "Print / PDF" still prints the page; "Print certificate" focuses on certificate. */
        @media print {
          body.printing-certificate * { visibility: hidden; }
          body.printing-certificate #observation-certificate,
          body.printing-certificate #observation-certificate * { visibility: visible; }
          body.printing-certificate #observation-certificate { position: fixed !important; inset: 0 !important; display: flex !important; align-items: center; justify-content: center; background: hsl(var(--background)); }
        }
      `}</style>
    </div>
  );
}
