import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { getJournalEntries, deleteJournalEntry, exportJournalAsJson, exportJournalAsCsv, type JournalEntry } from "@/lib/journal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotebookPen, Trash2, Calendar, MapPin, Star, ArrowRight, Download, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterGate } from "@/components/RegisterGate";
import { GUEST_JOURNAL_ENTRY_LIMIT } from "@/lib/featureAccess";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  const isGuestAtLimit = !user && entries.length >= GUEST_JOURNAL_ENTRY_LIMIT;

  const handleDelete = (id: string) => {
    deleteJournalEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success("Entry removed");
  };

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Observation <span className="gradient-text">Journal</span>
            </h1>
            <p className="text-muted-foreground mb-4">
              Your sky life — every observation in one place. Export for clubs or science with verification.
            </p>
            {entries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                  onClick={() => {
                    const blob = new Blob([exportJournalAsJson(entries)], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `alnitar-journal-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export JSON (club/science)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                  onClick={() => {
                    const blob = new Blob([exportJournalAsCsv(entries)], { type: "text/csv" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `alnitar-journal-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV (club/science)
                </Button>
              </div>
            )}
            {!user && (
              <p className="text-sm text-muted-foreground/90 mb-6">
                {entries.length >= 3
                  ? "You're building a real stargazing history! Sign up to keep every observation forever and get unlimited entries."
                  : `Save up to ${GUEST_JOURNAL_ENTRY_LIMIT} entries free. Create an account for unlimited + cloud backup.`}{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">Create free account</Link>
              </p>
            )}
          </motion.div>

          {isGuestAtLimit && (
            <RegisterGate
              variant="card"
              title="Your journal is getting good — don't lose it"
              description={`You've saved ${GUEST_JOURNAL_ENTRY_LIMIT} observations. Create a free account to add unlimited entries and sync your journal everywhere.`}
              benefits={["Unlimited journal entries", "Cloud backup — never lose a discovery", "Same journal on phone, tablet, and desktop"]}
            />
          )}

          {entries.length === 0 && !isGuestAtLimit ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
              <NotebookPen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">No observations yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Upload a sky photo to identify constellations and save them to your journal.
              </p>
              <Button asChild className="btn-glow">
                <Link to="/recognize">
                  Start Recognizing <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 flex items-start gap-4"
                  >
                    {entry.imageThumbnail && (
                      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted/30">
                        <img src={entry.imageThumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/learn/${entry.constellationId}`}
                              className="font-display font-semibold hover:text-primary transition-colors"
                            >
                              {entry.constellationName}
                            </Link>
                            {entry.verifiedAt && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5 bg-primary/10 text-primary border-primary/20">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {entry.confidence}% confidence
                            </span>
                            {entry.location && entry.location !== "Unknown" && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {entry.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-foreground/70 mt-2">{entry.notes}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
