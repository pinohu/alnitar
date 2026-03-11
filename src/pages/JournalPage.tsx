import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { getJournalEntries, deleteJournalEntry, exportJournalAsJson, exportJournalAsCsv, printJournalAsPdf, type JournalEntry } from "@/lib/journal";
import { JournalService } from "@/lib/services/journalService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NotebookPen, Trash2, Calendar, MapPin, Star, ArrowRight, Download, ShieldCheck, Search, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterGate } from "@/components/RegisterGate";
import { GUEST_JOURNAL_ENTRY_LIMIT, hasProCloudBackup } from "@/lib/featureAccess";

function filterEntries(
  entries: JournalEntry[],
  opts: { query?: string; dateFrom?: string; dateTo?: string; location?: string }
): JournalEntry[] {
  let out = entries;
  const q = (opts.query ?? "").trim().toLowerCase();
  if (q) {
    out = out.filter(
      (e) =>
        e.constellationName.toLowerCase().includes(q) ||
        e.notes.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  }
  if (opts.dateFrom) {
    out = out.filter((e) => e.date >= opts.dateFrom!);
  }
  if (opts.dateTo) {
    out = out.filter((e) => e.date <= opts.dateTo!);
  }
  if ((opts.location ?? "").trim()) {
    const loc = opts.location!.trim().toLowerCase();
    out = out.filter((e) => e.location.toLowerCase().includes(loc));
  }
  return out;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user && hasProCloudBackup(user)) {
      JournalService.getEntries(user.id).then(setEntries);
    } else {
      setEntries(getJournalEntries());
    }
  }, [user]);

  const filteredEntries = useMemo(
    () => filterEntries(entries, { query: searchQuery, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, location: locationFilter || undefined }),
    [entries, searchQuery, dateFrom, dateTo, locationFilter]
  );

  const isGuestAtLimit = !user && entries.length >= GUEST_JOURNAL_ENTRY_LIMIT;

  const handleDelete = (id: string) => {
    if (user && hasProCloudBackup(user)) {
      JournalService.deleteEntry(id, user.id);
    } else {
      deleteJournalEntry(id);
    }
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
              Every observation in one place — searchable and exportable. Build a permanent log you can share with your club or use for programs.
            </p>
            {entries.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center min-w-0">
                  <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by constellation, notes, location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-card/60 border-border/40"
                    />
                  </div>
                  <Input
                    type="date"
                    placeholder="From"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-36 bg-card/60 border-border/40"
                    aria-label="Date from"
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-36 bg-card/60 border-border/40"
                    aria-label="Date to"
                  />
                  <Input
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-36 bg-card/60 border-border/40"
                    aria-label="Filter by location"
                  />
                </div>
                <div className="flex flex-wrap gap-2 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                  onClick={() => {
                    const blob = new Blob([exportJournalAsJson(filteredEntries)], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `alnitar-journal-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50"
                  onClick={() => {
                    const blob = new Blob([exportJournalAsCsv(filteredEntries)], { type: "text/csv" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `alnitar-journal-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" className="border-border/50" asChild>
                  <Link to="/journal/year-in-review">
                    <Calendar className="w-4 h-4 mr-1" />
                    Year in review
                  </Link>
                </Button>
                {user && hasProCloudBackup(user) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50"
                    onClick={() => printJournalAsPdf(filteredEntries)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Export PDF
                  </Button>
                )}
                </div>
                {filteredEntries.length < entries.length && (
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredEntries.length} of {entries.length} entries
                  </p>
                )}
              </div>
            )}
            {!user && (
              <p className="text-sm text-muted-foreground/90 mb-6">
                {entries.length >= 3
                  ? "You're building a real log. Create a free account to keep every observation forever and sync your journal everywhere."
                  : `Save up to ${GUEST_JOURNAL_ENTRY_LIMIT} entries on this device. Create a free account for unlimited entries and cloud backup.`}{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">Create free account</Link>
              </p>
            )}
          </motion.div>

          {isGuestAtLimit && (
            <RegisterGate
              variant="card"
              title="Don't lose what you've logged"
              description={`You've saved ${GUEST_JOURNAL_ENTRY_LIMIT} observations. Create a free account to add unlimited entries and sync your journal to every device.`}
              benefits={["Unlimited journal entries", "Cloud backup — your log follows you", "One journal on phone, tablet, and desktop"]}
            />
          )}

          {entries.length === 0 && !isGuestAtLimit ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
              <NotebookPen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">No observations yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Identify a sky photo and save the result here. Your first entry is one tap away.
              </p>
              <Button asChild className="btn-glow">
                <Link to="/recognize">
                  Identify a photo <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          ) : filteredEntries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold mb-1">No matches</h3>
              <p className="text-sm text-muted-foreground mb-4">Try different search terms or date range.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setDateFrom(""); setDateTo(""); setLocationFilter(""); }}>
                Clear filters
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredEntries.map((entry, i) => (
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
