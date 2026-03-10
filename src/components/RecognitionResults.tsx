import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowLeft, MapPin, Calendar, Star, Telescope, BookOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConstellationDiagram } from "./ConstellationDiagram";
import { type RecognitionOutput, type RecognitionResult } from "@/lib/recognition";
import { addJournalEntry, getJournalEntries } from "@/lib/journal";
import { GUEST_JOURNAL_ENTRY_LIMIT } from "@/lib/featureAccess";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Props {
  output: RecognitionOutput;
  imageUrl?: string | null;
  onReset: () => void;
}

export function RecognitionResults({ output, imageUrl, onReset }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const topResult = output.results[0];
  const otherResults = output.results.slice(1);
  const isLowConfidence = topResult && topResult.confidence < 50;

  const saveToJournal = (r: RecognitionResult) => {
    if (!user && getJournalEntries().length >= GUEST_JOURNAL_ENTRY_LIMIT) {
      toast.error(`Sign up to save more than ${GUEST_JOURNAL_ENTRY_LIMIT} journal entries.`);
      return;
    }
    addJournalEntry({
      date: new Date().toISOString().split("T")[0],
      constellationId: r.constellation.id,
      constellationName: r.constellation.name,
      confidence: r.confidence,
      notes: "",
      location: "Unknown",
      imageThumbnail: imageUrl || undefined,
    });
    setSaved(prev => new Set(prev).add(r.id));
    toast.success(`Saved ${r.constellation.name} to your journal`);
  };

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> New scan
        </Button>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{output.detectedStarCount} stars detected</span>
          <span>{output.processingTimeMs}ms</span>
        </div>
      </div>

      {/* Low confidence warning */}
      {isLowConfidence && (
        <div className="glass-card p-4 border-accent/30">
          <p className="text-sm text-accent font-medium mb-1">Low confidence matches</p>
          <p className="text-sm text-muted-foreground">
            Try retaking with steadier framing, a darker sky, or pointing slightly wider to capture more context.
          </p>
        </div>
      )}

      {/* Top match */}
      {topResult && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              {isLowConfidence ? "Best possible match" : "Top match"}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="rounded-xl bg-muted/20 p-3">
                  <ConstellationDiagram
                    constellation={topResult.constellation}
                    width={180}
                    height={180}
                    showLabels
                    animated
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold">{topResult.constellation.name}</h2>
                  <div className="shrink-0">
                    <div className="text-2xl font-display font-bold text-primary">{topResult.confidence}%</div>
                    <div className="text-xs text-muted-foreground text-right">confidence</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{topResult.constellation.alternateNames.join(" · ")}</p>

                <div className="confidence-bar mb-5">
                  <div className="confidence-bar-fill" style={{ width: `${topResult.confidence}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{topResult.constellation.bestMonths.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="capitalize">{topResult.constellation.hemisphere} hemisphere</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mythology */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <h4 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Mythology & History
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{topResult.constellation.mythology}</p>
            </div>

            {/* Stars */}
            <div className="mt-5 pt-5 border-t border-border/30">
              <h4 className="font-display font-semibold text-sm mb-3">Brightest Stars</h4>
              <div className="flex flex-wrap gap-2">
                {topResult.constellation.stars
                  .sort((a, b) => a.magnitude - b.magnitude)
                  .slice(0, 5)
                  .map(s => (
                    <Badge key={s.name} variant="secondary" className="bg-muted/50 border-0">
                      {s.name} <span className="text-muted-foreground ml-1">({s.magnitude.toFixed(1)}m)</span>
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Deep sky objects */}
            {topResult.constellation.deepSkyObjects.length > 0 && (
              <div className="mt-5 pt-5 border-t border-border/30">
                <h4 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                  <Telescope className="w-4 h-4 text-primary" /> Notable Objects
                </h4>
                <div className="space-y-2">
                  {topResult.constellation.deepSkyObjects.map(obj => (
                    <div key={obj.name} className="text-sm">
                      <span className="font-medium">{obj.name}</span>
                      <span className="text-muted-foreground"> — {obj.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why this match */}
            <div className="mt-5">
              <button
                onClick={() => setExpanded(expanded === topResult.id ? null : topResult.id)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {expanded === topResult.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Why this match?
              </button>
              <AnimatePresence>
                {expanded === topResult.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-lg bg-muted/20 text-sm text-foreground/80 leading-relaxed">
                      {topResult.reason}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                <Link to={`/learn/${topResult.constellation.slug}`}>
                  Learn more →
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveToJournal(topResult)}
                disabled={saved.has(topResult.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Save className="w-4 h-4 mr-1" />
                {saved.has(topResult.id) ? "Saved" : "Save to journal"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Other matches */}
      {otherResults.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm text-muted-foreground mb-3">
            {isLowConfidence ? "Other possible matches" : "Other matches"}
          </h3>
          <div className="space-y-3">
            {otherResults.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="shrink-0 rounded-lg bg-muted/20">
                  <ConstellationDiagram constellation={r.constellation} width={60} height={60} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-semibold truncate">{r.constellation.name}</h4>
                    <span className="text-sm font-display font-bold text-muted-foreground">{r.confidence}%</span>
                  </div>
                  <div className="confidence-bar mt-2">
                    <div className="confidence-bar-fill" style={{ width: `${r.confidence}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button asChild variant="ghost" size="sm" className="text-xs px-2">
                    <Link to={`/learn/${r.constellation.slug}`}>View</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2"
                    onClick={() => saveToJournal(r)}
                    disabled={saved.has(r.id)}
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
