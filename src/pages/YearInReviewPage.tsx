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
import { Printer, Copy } from "lucide-react";
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
          </motion.div>
        </div>
      </div>
      <style>{`
        @media print {
          .no-print, .no-print * { display: none !important; }
        }
      `}</style>
    </div>
  );
}
