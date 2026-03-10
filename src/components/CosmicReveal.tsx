import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Telescope, MapPin, Sparkles, Eye, Share2, ChevronRight, Zap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConstellationDiagram } from "./ConstellationDiagram";
import { type RecognitionOutput, type RecognitionResult } from "@/lib/recognition";
import { type Constellation } from "@/data/constellations";
import { deepSkyCatalog } from "@/data/deepSkyObjects";
import { ShareCard } from "./ShareCard";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface Props {
  output: RecognitionOutput;
  imageUrl?: string | null;
  onReset: () => void;
  onShowStory?: (constellation: Constellation) => void;
}

/** The cosmic camera reveal — annotated photo overlay experience */
export function CosmicReveal({ output, imageUrl, onReset, onShowStory }: Props) {
  const [step, setStep] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [saved, setSaved] = useState(false);
  const top = output.results[0];
  const constellation = top?.constellation;

  const saveObservation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in to save observations to the global network");
      return;
    }
    try {
      const brightestStar = constellation?.stars?.sort((a, b) => a.magnitude - b.magnitude)[0];
      const payload: TablesInsert<"observations"> = {
        user_id: user.id,
        constellation_id: constellation?.id ?? "unknown",
        constellation_name: constellation?.name ?? "Unknown",
        confidence: top.confidence,
        equipment: "phone",
        device_type: "phone",
        brightness_estimate: brightestStar?.magnitude ?? undefined,
        alternate_matches: output.results.slice(1, 4).map(r => ({
          id: r.constellation.id,
          name: r.constellation.name,
          confidence: r.confidence,
        })),
      };
      await supabase.from("observations").insert(payload);
      setSaved(true);
      toast.success("Observation saved to the global sky network! 🌌");
    } catch {
      toast.error("Failed to save observation");
    }
  };
  const nearbyDSOs = useMemo(() =>
    constellation ? deepSkyCatalog.filter(d => d.constellation === constellation.id).slice(0, 3) : []
  , [constellation]);
  const nearbyConstellations = constellation?.nearbyConstellations?.slice(0, 3) ?? [];
  const hiddenObjects = nearbyDSOs.filter(d => d.visibility !== 'naked-eye');

  const revealSteps = useMemo(() => [
    { title: "Constellation Detected", icon: Sparkles, color: "text-primary" },
    { title: "Anchor Stars", icon: Star, color: "text-accent" },
    { title: "Hidden Objects", icon: Telescope, color: "text-secondary" },
    { title: "Nearby Constellations", icon: MapPin, color: "text-primary" },
  ], []);

  // Animate through steps automatically
  useEffect(() => {
    if (!top || step >= revealSteps.length) return;
    const timer = setTimeout(() => setStep(s => s + 1), 1800);
    return () => clearTimeout(timer);
  }, [step, revealSteps.length, top]);

  // Draw annotations on canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl || !constellation) return;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw detected stars
      if (step >= 1) {
        for (const sp of output.starPositions.slice(0, 15)) {
          const x = sp.x * canvas.width;
          const y = sp.y * canvas.height;
          const r = Math.max(2, sp.brightness * 6);

          // Star glow
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
          grad.addColorStop(0, `rgba(56, 189, 248, ${0.6 * sp.brightness})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);

          // Star dot
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * sp.brightness})`;
          ctx.fill();
        }

        // Draw constellation lines
        if (step >= 1) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          const stars = constellation.stars;
          for (const [a, b] of constellation.lines) {
            if (!stars[a] || !stars[b]) continue;
            ctx.beginPath();
            ctx.moveTo(stars[a].x * canvas.width, stars[a].y * canvas.height);
            ctx.lineTo(stars[b].x * canvas.width, stars[b].y * canvas.height);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // Star labels for brightest
        const brightStars = [...constellation.stars].sort((a, b) => a.magnitude - b.magnitude).slice(0, 4);
        for (const s of brightStars) {
          const x = s.x * canvas.width;
          const y = s.y * canvas.height;
          ctx.font = `bold ${Math.max(12, canvas.width / 60)}px 'Space Grotesk', sans-serif`;
          ctx.fillStyle = "rgba(255, 220, 100, 0.9)";
          ctx.textAlign = "left";
          ctx.fillText(`⭐ ${s.name}`, x + 8, y - 6);
        }
      }

      // DSO markers
      if (step >= 2 && nearbyDSOs.length > 0) {
        for (const dso of nearbyDSOs) {
          // Place DSOs near constellation center with offset
          const cx = 0.3 + Math.random() * 0.4;
          const cy = 0.3 + Math.random() * 0.4;
          const x = cx * canvas.width;
          const y = cy * canvas.height;
          const r = 16;

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(168, 85, 247, 0.7)";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = `bold ${Math.max(11, canvas.width / 70)}px Inter, sans-serif`;
          ctx.fillStyle = "rgba(168, 85, 247, 0.9)";
          ctx.fillText(`🔭 ${dso.catalog}`, x + r + 6, y + 4);
        }
      }

      // Constellation name overlay
      ctx.font = `bold ${Math.max(20, canvas.width / 30)}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
      ctx.textAlign = "center";
      ctx.fillText(constellation.name, canvas.width / 2, canvas.height - 30);
    };
    img.src = imageUrl;
  }, [imageUrl, step, output.starPositions, constellation, nearbyDSOs]);

  if (!top || !constellation) return null;

  return (
    <div className="space-y-6">
      {/* Annotated Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden"
      >
        {imageUrl ? (
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-xl"
            style={{ maxHeight: "50vh", objectFit: "contain" }}
          />
        ) : (
          <div className="glass-card p-12 text-center">
            <ConstellationDiagram constellation={constellation} width={200} height={200} showLabels animated />
          </div>
        )}

        {/* Confidence badge */}
        <div className="absolute top-4 right-4 glass-card px-3 py-1.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-lg text-primary">{top.confidence}%</span>
        </div>
      </motion.div>

      {/* Your Sky Explained header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          🌌 Your Sky Explained
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Constellation detected: <strong className="text-foreground">{constellation.name}</strong> · Confidence: {top.confidence}%
        </p>
      </motion.div>

      {/* Progressive reveal steps */}
      <div className="space-y-4">
        {/* Step 1 — Constellation */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">Constellation Detected</h3>
              </div>
              <div className="flex gap-4 items-center">
                <div className="shrink-0 rounded-lg bg-muted/20 p-2">
                  <ConstellationDiagram constellation={constellation} width={80} height={80} showLabels />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-xl">{constellation.name}</h4>
                  <p className="text-xs text-muted-foreground">{constellation.alternateNames[0]}</p>
                  <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{constellation.mythology.slice(0, 120)}…</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2 — Anchor Stars */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-accent" />
                <h3 className="font-display font-semibold text-sm">⭐ Anchor Stars</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">The brightest stars in your photo include:</p>
              <div className="space-y-2">
                {constellation.stars.sort((a, b) => a.magnitude - b.magnitude).slice(0, 4).map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="font-display font-semibold text-sm">{s.name}</span>
                    <span className="text-xs text-muted-foreground">— mag {s.magnitude.toFixed(1)}</span>
                    {s.spectralType && (
                      <Badge variant="outline" className="text-[10px] border-border/30 ml-auto">{s.spectralType}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3 — Hidden Objects */}
        <AnimatePresence>
          {step >= 3 && nearbyDSOs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-5 border-secondary/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Telescope className="w-4 h-4 text-secondary" />
                <h3 className="font-display font-semibold text-sm">🔭 Hidden Objects in Your Photo</h3>
              </div>
              {hiddenObjects.length > 0 && (
                <div className="glass-card p-3 mb-3 bg-secondary/5 border-secondary/10">
                  <p className="text-xs text-secondary font-medium">
                    ✨ You also captured {hiddenObjects.length === 1 ? 'an object' : 'objects'} you didn't notice!
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {nearbyDSOs.map(dso => (
                  <div key={dso.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Telescope className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm">{dso.catalog} — {dso.name}</span>
                        <Badge variant="outline" className="text-[10px] border-border/30 capitalize">{dso.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Distance: {dso.distance} · Magnitude: {dso.magnitude}
                      </p>
                      <p className="text-xs text-foreground/70 mt-1">{dso.description.slice(0, 100)}…</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4 — Nearby Constellations */}
        <AnimatePresence>
          {step >= 4 && nearbyConstellations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">🌍 Nearby Constellations</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Your photo also contains parts of:</p>
              <div className="flex flex-wrap gap-2">
                {nearbyConstellations.map(name => (
                  <Badge key={name} variant="secondary" className="bg-primary/10 text-primary border-0 capitalize">
                    {name.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fun fact */}
      {step >= 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 border-accent/20"
        >
          <p className="text-xs text-accent font-medium mb-1">💡 Did you know?</p>
          <p className="text-sm text-foreground/80">{constellation.funFact}</p>
        </motion.div>
      )}

      {/* Action buttons */}
      {step >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          {onShowStory && (
            <Button onClick={() => onShowStory(constellation)} className="btn-glow">
              <Eye className="w-4 h-4 mr-2" />
              Full Sky Story
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          <Button variant="outline" className="border-border/50" onClick={() => setShowShare(!showShare)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Discovery
          </Button>
          {!saved ? (
            <Button variant="outline" className="border-primary/30 text-primary" onClick={saveObservation}>
              <Save className="w-4 h-4 mr-2" />
              Save to Network
            </Button>
          ) : (
            <Badge className="bg-primary/10 text-primary border-0 py-2 px-3">✓ Saved to Global Network</Badge>
          )}
          <Button variant="ghost" className="text-muted-foreground" onClick={onReset}>
            New Scan
          </Button>
        </motion.div>
      )}

      {/* Share card */}
      <AnimatePresence>
        {showShare && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <ShareCard constellation={constellation} confidence={top.confidence} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border/20">
        <span>{output.detectedStarCount} stars detected</span>
        <span>{output.processingTimeMs}ms processing</span>
        <span>{output.results.length} matches found</span>
      </div>
    </div>
  );
}
