import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { analyzeFromFile, type AstroAnalysis } from "@/lib/astrophotography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Loader2, Eye, Sparkles, AlertCircle, Target, ArrowLeft } from "lucide-react";

function ScoreBar({ label, value, color = "primary" }: { label: string; value: number; color?: string }) {
  const colorClass = color === "accent" ? "bg-accent" : color === "destructive" ? "bg-destructive" : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

export default function AstroPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AstroAnalysis | null>(null);

  const handleFile = useCallback(async (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeFromFile(f);
      // Add slight delay for UX
      await new Promise(r => setTimeout(r, 1200));
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
  };

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Astrophotography <span className="gradient-text">Assist</span>
            </h1>
            <p className="text-muted-foreground mb-8">
              Upload a sky photo to get image quality analysis and improvement tips.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div
                  className="glass-card border-2 border-dashed p-12 sm:p-16 text-center cursor-pointer border-border/50 hover:border-primary/40 transition-all"
                  onClick={() => document.getElementById("astro-input")?.click()}
                >
                  <input
                    id="astro-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">Upload your sky photo</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get feedback on sharpness, exposure, noise, and framing
                  </p>
                  <Button variant="outline" size="sm" className="border-border/50">
                    <Upload className="w-4 h-4 mr-2" /> Choose File
                  </Button>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 text-center">
                <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="font-display text-lg font-semibold mb-2">Analyzing image quality…</h3>
                <p className="text-sm text-muted-foreground">Evaluating sharpness, noise, and framing</p>
                {preview && (
                  <div className="mt-6 rounded-lg overflow-hidden max-w-sm mx-auto opacity-50">
                    <img src={preview} alt="Uploaded" className="w-full" />
                  </div>
                )}
              </motion.div>
            )}

            {analysis && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground mb-4">
                  <ArrowLeft className="w-4 h-4 mr-1" /> New analysis
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Image preview */}
                  {preview && (
                    <div className="glass-card p-4">
                      <img src={preview} alt="Analyzed" className="w-full rounded-lg" />
                    </div>
                  )}

                  {/* Scores */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-display font-semibold mb-2">Image Quality Scores</h3>
                    <ScoreBar label="Sharpness" value={analysis.blurScore} />
                    <ScoreBar label="Sky Darkness" value={100 - analysis.brightnessScore} color="accent" />
                    <ScoreBar label="Noise Level" value={analysis.noiseLevel} color={analysis.noiseLevel > 60 ? "destructive" : "primary"} />
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-1">Star Density</p>
                      <p className="text-sm font-medium">{analysis.starDensity} stars detected</p>
                    </div>
                  </div>
                </div>

                {/* Framing & Exposure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="glass-card p-5">
                    <h4 className="font-display font-semibold text-sm flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-primary" /> Framing
                    </h4>
                    <p className="text-sm text-foreground/80">{analysis.framingQuality}</p>
                    {analysis.suggestedFovDegrees != null && (
                      <p className="text-xs text-primary mt-2">Frame target with ~{analysis.suggestedFovDegrees}° FOV for best composition.</p>
                    )}
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="font-display font-semibold text-sm flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent" /> Exposure
                    </h4>
                    <p className="text-sm text-foreground/80">{analysis.exposureHint}</p>
                    {(analysis.suggestedExposureMinSec != null || analysis.suggestedIso != null) && (
                      <p className="text-xs text-primary mt-2">
                        Suggested: {analysis.suggestedExposureMinSec ?? 30}–{analysis.suggestedExposureMaxSec ?? 120} s at ISO {analysis.suggestedIso ?? 800}.
                      </p>
                    )}
                    {analysis.stackingDocLink && (
                      <a href={analysis.stackingDocLink} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-2 inline-block">
                        Stack with Siril/PixInsight →
                      </a>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="glass-card p-6 mb-6">
                  <h4 className="font-display font-semibold text-sm flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-primary" /> Improvement Tips
                  </h4>
                  <div className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-foreground/80">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended targets */}
                <div className="glass-card p-6">
                  <h4 className="font-display font-semibold text-sm flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-secondary" /> Recommended Targets
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.targets.map(t => (
                      <div key={t.name} className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                        <div className="flex-1">
                          <span className="text-sm font-medium">{t.name}</span>
                          <div className="flex gap-1.5 mt-1">
                            <Badge variant="secondary" className="text-xs bg-muted/50 border-0">{t.type}</Badge>
                            <Badge variant="outline" className="text-xs border-border/50">{t.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
