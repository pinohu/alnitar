import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Star, Telescope, BookOpen, Eye, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConstellationDiagram } from "./ConstellationDiagram";
import { type RecognitionResult, type RecognitionOutput } from "@/lib/recognition";
import { constellations, getConstellationById } from "@/data/constellations";

interface Props {
  output: RecognitionOutput;
  onClose: () => void;
}

interface StoryStep {
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export function SkyStoryMode({ output, onClose }: Props) {
  const [step, setStep] = useState(0);
  const topResult = output.results[0];
  if (!topResult) return null;

  const c = topResult.constellation;
  const nearby = (c.nearbyConstellations ?? [])
    .map(id => getConstellationById(id))
    .filter(Boolean)
    .slice(0, 3);

  const steps: StoryStep[] = [
    {
      title: "Constellation Recognized",
      icon: Star,
      content: (
        <div className="text-center">
          <div className="mx-auto w-fit rounded-xl bg-muted/20 p-4 mb-4">
            <ConstellationDiagram constellation={c} width={220} height={220} showLabels animated />
          </div>
          <h3 className="font-display text-2xl font-bold mb-1">{c.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{c.alternateNames[0]}</p>
          {c.pronunciation && (
            <p className="text-xs text-muted-foreground italic mb-3">Pronounced: {c.pronunciation}</p>
          )}
          <div className="text-3xl font-display font-bold text-primary">{topResult.confidence}%</div>
          <p className="text-xs text-muted-foreground">confidence</p>
        </div>
      ),
    },
    {
      title: "Anchor Stars",
      icon: Sparkles,
      content: (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            These are the key stars we identified to match the {c.name} pattern:
          </p>
          <div className="space-y-3">
            {c.stars.sort((a, b) => a.magnitude - b.magnitude).slice(0, 5).map((star, i) => (
              <motion.div
                key={star.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
              >
                <div className={`w-3 h-3 rounded-full ${star.magnitude < 1 ? "bg-accent" : star.magnitude < 2 ? "bg-primary" : "bg-foreground/60"}`} />
                <div className="flex-1">
                  <span className="font-medium text-sm">{star.name}</span>
                  {star.spectralType && <span className="text-xs text-muted-foreground ml-2">({star.spectralType})</span>}
                </div>
                <span className="text-xs text-muted-foreground">{star.magnitude.toFixed(1)}m</span>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Pattern Geometry",
      icon: Eye,
      content: (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            The constellation pattern connects {c.lines.length} star pairs forming the distinctive shape of {c.name}:
          </p>
          <div className="mx-auto w-fit rounded-xl bg-muted/20 p-4 mb-4">
            <ConstellationDiagram constellation={c} width={260} height={260} showLabels animated />
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{c.spottingTips}</p>
        </div>
      ),
    },
    {
      title: "Nearby Constellations",
      icon: MapPin,
      content: (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            When viewing {c.name}, you can also look for these nearby constellations:
          </p>
          {nearby.length > 0 ? (
            <div className="grid gap-3">
              {nearby.map((nc, i) => nc && (
                <motion.div
                  key={nc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                >
                  <div className="shrink-0 rounded bg-muted/30">
                    <ConstellationDiagram constellation={nc} width={50} height={50} />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{nc.name}</span>
                    <p className="text-xs text-muted-foreground">{nc.alternateNames[0]}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs bg-muted/50 border-0">{nc.bestSeason}</Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Explore the sky map to discover nearby constellations.</p>
          )}
        </div>
      ),
    },
    {
      title: "Deep Sky Objects",
      icon: Telescope,
      content: (
        <div>
          {c.deepSkyObjects.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                These deep sky objects are located in or near {c.name}:
              </p>
              <div className="space-y-3">
                {c.deepSkyObjects.map((obj, i) => (
                  <motion.div
                    key={obj.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="p-4 rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{obj.name}</span>
                      <Badge variant="outline" className="text-xs border-border/50 capitalize">{obj.type}</Badge>
                    </div>
                    <p className="text-xs text-foreground/70">{obj.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      {obj.magnitude && <span>{obj.magnitude}m</span>}
                      {obj.distance && <span>{obj.distance}</span>}
                      {obj.visibility && <span className="capitalize">{obj.visibility.replace("-", " ")}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No major deep sky objects cataloged in this region, but the constellation itself is a beautiful sight!</p>
          )}
        </div>
      ),
    },
    {
      title: "Learn to Spot It",
      icon: BookOpen,
      content: (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Here's how to find {c.name} without the app:</p>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/20">
              <h4 className="font-medium text-sm mb-2">🔭 Spotting Tips</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{c.spottingTips}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/20">
              <h4 className="font-medium text-sm mb-2">📖 Mythology</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{c.mythology.slice(0, 200)}…</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-medium text-sm mb-2 text-primary">💡 Fun Fact</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{c.funFact}</p>
            </div>
            {c.commonMistakes && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="font-medium text-sm mb-2 text-accent">⚠️ Common Mistake</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">{c.commonMistakes}</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      {/* Step header */}
      <div className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-display font-semibold">{currentStep.title}</span>
        <span className="text-muted-foreground ml-auto">{step + 1} / {steps.length}</span>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-6 min-h-[300px]"
        >
          {currentStep.content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => step > 0 ? setStep(step - 1) : onClose()}
          className="text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {step === 0 ? "Back to results" : "Previous"}
        </Button>
        {step < steps.length - 1 ? (
          <Button size="sm" onClick={() => setStep(step + 1)} className="btn-glow">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" onClick={onClose} variant="outline" className="border-border/50">
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
