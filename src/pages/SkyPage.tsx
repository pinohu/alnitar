import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { constellations, type Constellation } from "@/data/constellations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Compass, Eye, EyeOff, Tag, Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const TOURS = [
  { name: "Find Orion", id: "orion" },
  { name: "Find Ursa Major", id: "ursa-major" },
  { name: "Find Scorpius", id: "scorpius" },
];

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

export default function SkyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLines, setShowLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showDeepSky, setShowDeepSky] = useState(false);
  const [altitude, setAltitude] = useState([45]);
  const [directionIdx, setDirectionIdx] = useState(0);
  const [selected, setSelected] = useState<Constellation | null>(null);
  const [tourTarget, setTourTarget] = useState<string | null>(null);
  const [location] = useState("40.7°N, 74°W");
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);

  useEffect(() => { trackEvent("sky_mode_opened"); }, []);

  const direction = DIRECTIONS[directionIdx];

  // Determine visible constellations based on direction/altitude
  const visibleConstellations = constellations.slice(0, 12); // simplified

  // Draw sky canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "hsl(222, 47%, 3%)");
      grad.addColorStop(0.5, "hsl(230, 45%, 8%)");
      grad.addColorStop(1, "hsl(222, 47%, 5%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Random background stars
      const seed = directionIdx * 1000 + altitude[0];
      for (let i = 0; i < 100; i++) {
        const px = Math.sin(i * 127.1 + seed * 0.31) * 0.5 + 0.5;
        const py = Math.sin(i * 269.5 + seed * 0.47) * 0.5 + 0.5;
        const r = (Math.sin(i * 43.7) * 0.5 + 0.5) * 1.2 + 0.3;
        const a = 0.2 + (Math.sin(i * 17.3 + Date.now() * 0.001) * 0.5 + 0.5) * 0.3;
        ctx.beginPath();
        ctx.arc(px * w, py * h, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
        ctx.fill();
      }

      // Layout constellations in the view
      const padding = 60;
      const cols = Math.ceil(Math.sqrt(visibleConstellations.length));
      const cellW = (w - padding * 2) / cols;
      const rows = Math.ceil(visibleConstellations.length / cols);
      const cellH = (h - padding * 2) / rows;

      visibleConstellations.forEach((c, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = padding + col * cellW;
        const cy = padding + row * cellH;
        const isTourTarget = tourTarget === c.id;
        const isSelected = selected?.id === c.id;

        // Draw lines
        if (showLines) {
          c.lines.forEach(([a, b]) => {
            const sa = c.stars[a], sb = c.stars[b];
            if (!sa || !sb) return;
            ctx.beginPath();
            ctx.moveTo(cx + sa.x * cellW * 0.8, cy + sa.y * cellH * 0.8);
            ctx.lineTo(cx + sb.x * cellW * 0.8, cy + sb.y * cellH * 0.8);
            ctx.strokeStyle = isTourTarget
              ? "rgba(56, 189, 248, 0.8)"
              : isSelected
                ? "rgba(56, 189, 248, 0.6)"
                : "rgba(56, 189, 248, 0.25)";
            ctx.lineWidth = isTourTarget ? 2 : 1.2;
            ctx.stroke();
          });
        }

        // Draw stars
        c.stars.forEach(star => {
          const sx = cx + star.x * cellW * 0.8;
          const sy = cy + star.y * cellH * 0.8;
          const r = Math.max(1.5, 3.5 - star.magnitude * 0.4);
          const bright = star.magnitude < 2;

          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          if (isTourTarget) {
            ctx.fillStyle = bright ? "hsl(45, 95%, 65%)" : "hsl(200, 90%, 80%)";
            ctx.shadowColor = "hsl(45, 95%, 65%)";
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = bright ? "hsl(45, 90%, 70%)" : "hsl(210, 40%, 90%)";
            ctx.shadowColor = bright ? "hsla(45, 90%, 70%, 0.6)" : "transparent";
            ctx.shadowBlur = bright ? 4 : 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Labels
        if (showLabels) {
          ctx.font = "11px 'Space Grotesk', sans-serif";
          ctx.fillStyle = isTourTarget ? "rgba(56, 189, 248, 0.9)" : "rgba(180, 200, 220, 0.6)";
          ctx.textAlign = "center";
          const labelY = cy + cellH * 0.85;
          ctx.fillText(c.name, cx + cellW * 0.4, labelY);
        }

        // Deep sky objects
        if (showDeepSky && c.deepSkyObjects.length > 0) {
          c.deepSkyObjects.forEach((obj, oi) => {
            const ox = cx + (0.3 + oi * 0.2) * cellW * 0.8;
            const oy = cy + 0.6 * cellH * 0.8;
            ctx.beginPath();
            ctx.arc(ox, oy, 4, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
            ctx.lineWidth = 1;
            ctx.stroke();
            if (showLabels) {
              ctx.font = "9px Inter, sans-serif";
              ctx.fillStyle = "rgba(168, 85, 247, 0.6)";
              ctx.textAlign = "left";
              ctx.fillText(obj.name.split("—")[0].trim(), ox + 6, oy + 3);
            }
          });
        }
      });

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, h - 20);
      ctx.lineTo(w, h - 20);
      ctx.strokeStyle = "rgba(100, 120, 140, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "10px Inter, sans-serif";
      ctx.fillStyle = "rgba(100, 120, 140, 0.5)";
      ctx.textAlign = "center";
      ctx.fillText("Horizon", w / 2, h - 8);
    };

    draw();
    const interval = setInterval(draw, 2000); // slow redraw for twinkle

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(interval);
    };
  }, [showLines, showLabels, showDeepSky, altitude, directionIdx, selected, tourTarget, visibleConstellations]);

  // Handle canvas click to select constellation
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 60;
    const cols = Math.ceil(Math.sqrt(visibleConstellations.length));
    const cellW = (canvas.width - padding * 2) / cols;
    const rows = Math.ceil(visibleConstellations.length / cols);
    const cellH = (canvas.height - padding * 2) / rows;

    for (let idx = 0; idx < visibleConstellations.length; idx++) {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = padding + col * cellW;
      const cy = padding + row * cellH;
      if (x >= cx && x <= cx + cellW && y >= cy && y <= cy + cellH) {
        setSelected(visibleConstellations[idx]);
        setTourTarget(null);
        return;
      }
    }
    setSelected(null);
  }, [visibleConstellations]);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="relative z-10 pt-16 h-screen flex flex-col">
        {/* Controls bar */}
        <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl px-4 py-3">
          <div className="container flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">{location}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1.5">
                {showLines ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-xs text-muted-foreground">Lines</span>
                <Switch checked={showLines} onCheckedChange={setShowLines} className="scale-75" />
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-xs text-muted-foreground">Labels</span>
                <Switch checked={showLabels} onCheckedChange={setShowLabels} className="scale-75" />
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs text-muted-foreground">Deep sky</span>
                <Switch checked={showDeepSky} onCheckedChange={setShowDeepSky} className="scale-75" />
              </div>
            </div>
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
          />

          {/* Compass control */}
          <div className="absolute bottom-6 left-6 glass-card p-3 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setDirectionIdx((directionIdx - 1 + 8) % 8)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-display font-bold text-lg w-8 text-center text-primary">{direction}</span>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setDirectionIdx((directionIdx + 1) % 8)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Altitude slider */}
          <div className="absolute bottom-6 right-6 glass-card p-3 flex items-center gap-3 w-48">
            <span className="text-xs text-muted-foreground">Alt</span>
            <Slider value={altitude} onValueChange={setAltitude} min={0} max={90} step={5} className="flex-1" />
            <span className="text-xs font-mono text-muted-foreground w-8">{altitude[0]}°</span>
          </div>

          {/* Tour buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            {TOURS.map(t => (
              <Button
                key={t.id}
                size="sm"
                variant={tourTarget === t.id ? "default" : "outline"}
                className={`text-xs ${tourTarget === t.id ? "btn-glow" : "border-border/50 bg-background/60 backdrop-blur"}`}
                onClick={() => {
                  setTourTarget(tourTarget === t.id ? null : t.id);
                  setSelected(null);
                }}
              >
                {t.name}
              </Button>
            ))}
          </div>

          {/* Selected constellation panel */}
          {selected && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-4 right-4 glass-card p-5 w-72 max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-lg">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">{selected.alternateNames[0]}</p>
                </div>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs bg-muted/50 border-0">{selected.bestSeason}</Badge>
                  <Badge variant="secondary" className="text-xs bg-muted/50 border-0 capitalize">{selected.hemisphere}</Badge>
                </div>
                <p className="text-foreground/80 leading-relaxed">{selected.spottingTips}</p>
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Brightest stars</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.stars.sort((a,b) => a.magnitude - b.magnitude).slice(0,4).map(s => (
                      <Badge key={s.name} variant="outline" className="text-xs border-border/50">{s.name}</Badge>
                    ))}
                  </div>
                </div>
                {selected.deepSkyObjects.length > 0 && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">Notable objects</p>
                    {selected.deepSkyObjects.map(o => (
                      <p key={o.name} className="text-xs text-foreground/70">{o.name}</p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
