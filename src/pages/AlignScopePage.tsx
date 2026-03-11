import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crosshair, Compass } from "lucide-react";
// Bright stars commonly used for alignment (name, rough RA/Dec for display)
const ALIGNMENT_STARS = [
  { name: "Polaris", constellation: "Ursa Minor", ra: "02h 32m", dec: "+89°" },
  { name: "Vega", constellation: "Lyra", ra: "18h 37m", dec: "+38° 47'" },
  { name: "Altair", constellation: "Aquila", ra: "19h 51m", dec: "+08° 52'" },
  { name: "Deneb", constellation: "Cygnus", ra: "20h 41m", dec: "+45° 16'" },
  { name: "Capella", constellation: "Auriga", ra: "05h 17m", dec: "+46° 00'" },
  { name: "Sirius", constellation: "Canis Major", ra: "06h 45m", dec: "-16° 43'" },
  { name: "Betelgeuse", constellation: "Orion", ra: "05h 55m", dec: "+07° 24'" },
  { name: "Rigel", constellation: "Orion", ra: "05h 15m", dec: "-08° 12'" },
];

export default function AlignScopePage() {
  const [currentStar, setCurrentStar] = useState("");
  const [suggested, setSuggested] = useState<typeof ALIGNMENT_STARS[0] | null>(null);

  const handleSuggest = () => {
    const idx = ALIGNMENT_STARS.findIndex(
      (s) => s.name.toLowerCase() === currentStar.trim().toLowerCase()
    );
    const next = idx < 0
      ? ALIGNMENT_STARS[0]
      : ALIGNMENT_STARS[(idx + 1) % ALIGNMENT_STARS.length];
    setSuggested(next);
  };

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl font-bold">
                Align your <span className="gradient-text">scope</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Point at a known star, then we suggest the next alignment star. Uses the same catalog as the planetarium.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
            <label className="text-sm font-medium">Current star you&apos;re pointed at</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Polaris, Vega"
                value={currentStar}
                onChange={(e) => setCurrentStar(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
                className="bg-card/60"
              />
              <Button onClick={handleSuggest}>Suggest next</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Common alignment stars: {ALIGNMENT_STARS.map((s) => s.name).join(", ")}
            </p>

            {suggested && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Next: {suggested.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {suggested.constellation} — RA {suggested.ra} Dec {suggested.dec}
                </p>
                <p className="text-xs text-foreground/80 mt-1">
                  Center this star in your eyepiece and sync your mount (or enter it as current and suggest next again).
                </p>
              </motion.div>
            )}
          </motion.div>

          <p className="text-xs text-muted-foreground mt-4">
            Full mount control (e.g. Alpaca/INDI) can be added in a future release.
          </p>
        </div>
      </div>
    </div>
  );
}
