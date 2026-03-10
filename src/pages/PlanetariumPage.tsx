import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { constellations, type Constellation, getConstellationById } from "@/data/constellations";
import {
  equatorialToHorizontal,
  getVisibleConstellations,
  getVisibleDeepSkyObjects,
  getVisiblePlanets,
  getSkyConditions,
  starCatalogService,
} from "@/lib/astronomy";
import type { ObserverLocation } from "@/lib/astronomy/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Compass, Eye, EyeOff, Tag, Sparkles, X, Play, Pause,
  SkipForward, SkipBack, Moon, MapPin, Search, Clock,
  Layers, Grid3X3,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const DEFAULT_LOCATION: ObserverLocation = { latitude: 40.7, longitude: -74.0 };

export default function PlanetariumPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // View state
  const [panX, setPanX] = useState(0); // azimuth offset in degrees
  const [panY, setPanY] = useState(45); // altitude
  const [zoom, setZoom] = useState(1);

  // Overlays
  const [showLines, setShowLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showDeepSky, setShowDeepSky] = useState(true);
  const [showPlanets, setShowPlanets] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showHorizon, setShowHorizon] = useState(true);
  const [showMilkyWay, setShowMilkyWay] = useState(true);

  // Time controls
  const [simDate, setSimDate] = useState(new Date());
  const [playing, setPlaying] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(60); // seconds per frame tick

  // Location
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  // Selection
  const [selected, setSelected] = useState<Constellation | null>(null);
  const [highlightedConstellation, setHighlightedConstellation] = useState<string | null>(null);

  useEffect(() => { trackEvent("planetarium_opened"); }, []);

  // Time animation
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setSimDate(prev => new Date(prev.getTime() + timeSpeed * 1000));
    }, 50);
    return () => clearInterval(interval);
  }, [playing, timeSpeed]);

  // Compute visible objects
  const visibleConst = getVisibleConstellations(location, simDate);
  const visibleDSO = getVisibleDeepSkyObjects(location, simDate);
  const visiblePlanets = getVisiblePlanets(location, simDate);
  const skyConditions = getSkyConditions(location, simDate);
  const catalogStars = starCatalogService.getByMagnitudeLimit(skyConditions.limitingMagnitude + 2);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "hsl(222, 47%, 2%)");
      grad.addColorStop(0.4, "hsl(230, 45%, 6%)");
      grad.addColorStop(1, "hsl(222, 47%, 10%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Milky Way band (subtle)
      if (showMilkyWay) {
        const mwGrad = ctx.createLinearGradient(0, h * 0.3, w, h * 0.7);
        mwGrad.addColorStop(0, "transparent");
        mwGrad.addColorStop(0.3, "rgba(180, 200, 255, 0.03)");
        mwGrad.addColorStop(0.5, "rgba(180, 200, 255, 0.06)");
        mwGrad.addColorStop(0.7, "rgba(180, 200, 255, 0.03)");
        mwGrad.addColorStop(1, "transparent");
        ctx.fillStyle = mwGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Helper to project alt/az to screen
      const project = (alt: number, az: number): { x: number; y: number; visible: boolean } => {
        const fovH = 120 / zoom;
        const fovV = fovH * (h / w);
        let dAz = az - panX;
        if (dAz > 180) dAz -= 360;
        if (dAz < -180) dAz += 360;
        const dAlt = alt - panY;
        const x = w / 2 + (dAz / fovH) * w;
        const y = h / 2 - (dAlt / fovV) * h;
        const visible = x > -50 && x < w + 50 && y > -50 && y < h + 50;
        return { x, y, visible };
      };

      // Celestial grid
      if (showGrid) {
        ctx.strokeStyle = "rgba(100, 140, 180, 0.08)";
        ctx.lineWidth = 0.5;
        for (let az = 0; az < 360; az += 30) {
          ctx.beginPath();
          let started = false;
          for (let alt = 0; alt <= 90; alt += 2) {
            const p = project(alt, az);
            if (p.visible) {
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else ctx.lineTo(p.x, p.y);
            }
          }
          ctx.stroke();
        }
        for (let alt = 0; alt <= 90; alt += 15) {
          ctx.beginPath();
          let started = false;
          for (let az = 0; az <= 360; az += 2) {
            const p = project(alt, az);
            if (p.visible) {
              if (!started) { ctx.moveTo(p.x, p.y); started = true; }
              else ctx.lineTo(p.x, p.y);
            }
          }
          ctx.stroke();
        }
      }

      // Random background stars (faint)
      const seed = Math.floor(simDate.getTime() / 60000);
      for (let i = 0; i < 300; i++) {
        const sAz = ((Math.sin(i * 127.1 + seed * 0.0001) * 0.5 + 0.5) * 360);
        const sAlt = ((Math.sin(i * 269.5 + seed * 0.0002) * 0.5 + 0.5) * 90);
        const p = project(sAlt, sAz);
        if (!p.visible) continue;
        const twinkle = Math.sin(Date.now() * 0.003 + i * 43.7) * 0.3 + 0.7;
        const r = (Math.sin(i * 17.3) * 0.5 + 0.5) * 0.8 + 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * zoom, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${0.15 * twinkle})`;
        ctx.fill();
      }

      // Catalog stars
      for (const star of catalogStars) {
        const pos = equatorialToHorizontal(star.ra, star.dec, location, simDate);
        if (pos.altitude < -5) continue;
        const p = project(pos.altitude, pos.azimuth);
        if (!p.visible) continue;

        const r = Math.max(1, (3.5 - star.magnitude * 0.5)) * zoom;
        const alpha = Math.min(1, Math.max(0.2, 1 - star.magnitude / 5));

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = star.color || '#ffffff';
        ctx.globalAlpha = alpha;
        if (star.magnitude < 1) {
          ctx.shadowColor = star.color || '#ffffff';
          ctx.shadowBlur = 6 * zoom;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        if (showLabels && star.magnitude < 1.5 && zoom >= 0.8) {
          ctx.font = `${10 * zoom}px 'Space Grotesk', sans-serif`;
          ctx.fillStyle = "rgba(200, 220, 255, 0.7)";
          ctx.textAlign = "left";
          ctx.fillText(star.name, p.x + r + 4, p.y + 3);
        }
      }

      // Constellation overlays
      for (const vc of visibleConst) {
        if (!vc.isVisible) continue;
        const c = vc.constellation;
        const isHighlighted = highlightedConstellation === c.id;
        const isSelected = selected?.id === c.id;
        const dim = highlightedConstellation && !isHighlighted;

        // Get star positions in alt/az
        const raMatch = c.rightAscension.match(/(\d+)h\s*(\d+)m?/);
        const decMatch = c.declination.match(/([+-]?\d+)°/);
        const cRA = raMatch ? (parseInt(raMatch[1]) + parseInt(raMatch[2] || '0') / 60) * 15 : 0;
        const cDec = decMatch ? parseInt(decMatch[1]) : 0;

        const starPositions = c.stars.map(s => {
          const starRA = cRA + (s.x - 0.5) * 15;
          const starDec = cDec + (0.5 - s.y) * 15;
          const pos = equatorialToHorizontal(starRA, starDec, location, simDate);
          return { ...s, alt: pos.altitude, az: pos.azimuth, proj: project(pos.altitude, pos.azimuth) };
        });

        const anyVisible = starPositions.some(sp => sp.proj.visible && sp.alt > 0);
        if (!anyVisible) continue;

        // Lines
        if (showLines) {
          for (const [a, b] of c.lines) {
            const sa = starPositions[a], sb = starPositions[b];
            if (!sa || !sb) continue;
            if (!sa.proj.visible && !sb.proj.visible) continue;
            ctx.beginPath();
            ctx.moveTo(sa.proj.x, sa.proj.y);
            ctx.lineTo(sb.proj.x, sb.proj.y);
            ctx.strokeStyle = isHighlighted
              ? "rgba(56, 189, 248, 0.8)"
              : isSelected
                ? "rgba(56, 189, 248, 0.6)"
                : dim
                  ? "rgba(56, 189, 248, 0.08)"
                  : "rgba(56, 189, 248, 0.2)";
            ctx.lineWidth = (isHighlighted ? 2 : 1.2) * zoom;
            ctx.stroke();
          }
        }

        // Constellation label
        if (showLabels && !dim) {
          const center = project(vc.altitude, vc.azimuth);
          if (center.visible) {
            ctx.font = `${(isHighlighted ? 13 : 11) * zoom}px 'Space Grotesk', sans-serif`;
            ctx.fillStyle = isHighlighted
              ? "rgba(56, 189, 248, 0.9)"
              : "rgba(180, 200, 220, 0.5)";
            ctx.textAlign = "center";
            ctx.fillText(c.name, center.x, center.y + 20 * zoom);
          }
        }
      }

      // Deep sky objects
      if (showDeepSky) {
        for (const dso of visibleDSO) {
          const p = project(dso.altitude, dso.azimuth);
          if (!p.visible) continue;
          const r = 5 * zoom;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          if (showLabels && zoom >= 0.8) {
            ctx.font = `${9 * zoom}px Inter, sans-serif`;
            ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
            ctx.textAlign = "left";
            ctx.fillText(dso.name, p.x + r + 4, p.y + 3);
          }
        }
      }

      // Planets
      if (showPlanets) {
        for (const planet of visiblePlanets) {
          if (planet.altitude < 0) continue;
          const p = project(planet.altitude, planet.azimuth);
          if (!p.visible) continue;
          const r = Math.max(3, (4 - planet.magnitude * 0.5)) * zoom;
          const colors: Record<string, string> = {
            Mercury: '#e8e0d0', Venus: '#fffae0', Mars: '#ff8060',
            Jupiter: '#ffd090', Saturn: '#ffe0a0',
          };
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = colors[planet.name] || '#ffffff';
          ctx.shadowColor = colors[planet.name] || '#ffffff';
          ctx.shadowBlur = 8 * zoom;
          ctx.fill();
          ctx.shadowBlur = 0;
          if (showLabels) {
            ctx.font = `${11 * zoom}px 'Space Grotesk', sans-serif`;
            ctx.fillStyle = "rgba(255, 240, 200, 0.9)";
            ctx.textAlign = "left";
            ctx.fillText(planet.name, p.x + r + 5, p.y + 3);
          }
        }
      }

      // Horizon line
      if (showHorizon) {
        ctx.beginPath();
        let started = false;
        for (let az = 0; az <= 360; az += 1) {
          const p = project(0, az);
          if (p.visible) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          }
        }
        ctx.strokeStyle = "rgba(100, 180, 120, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cardinal directions
        const cardinals = [
          { label: 'N', az: 0 }, { label: 'E', az: 90 },
          { label: 'S', az: 180 }, { label: 'W', az: 270 },
        ];
        for (const c of cardinals) {
          const p = project(0, c.az);
          if (p.visible) {
            ctx.font = `${12 * zoom}px 'Space Grotesk', sans-serif`;
            ctx.fillStyle = "rgba(100, 180, 120, 0.6)";
            ctx.textAlign = "center";
            ctx.fillText(c.label, p.x, p.y + 18);
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [panX, panY, zoom, showLines, showLabels, showDeepSky, showPlanets, showGrid, showHorizon, showMilkyWay, simDate, location, highlightedConstellation, selected, catalogStars, visibleConst, visibleDSO, visiblePlanets]);

  // Pan/zoom handlers
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPanX(prev => (prev - dx * 0.3 / zoom + 360) % 360);
    setPanY(prev => Math.max(0, Math.min(90, prev + dy * 0.3 / zoom)));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [zoom]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(5, prev * (1 - e.deltaY * 0.001))));
  }, []);

  // Canvas click — select constellation
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const w = rect.width, h = rect.height;

    // Find closest constellation
    const fovH = 120 / zoom;
    const fovV = fovH * (h / w);
    let closest: Constellation | null = null;
    let minDist = 30;

    for (const vc of visibleConst) {
      if (!vc.isVisible) continue;
      let dAz = vc.azimuth - panX;
      if (dAz > 180) dAz -= 360;
      if (dAz < -180) dAz += 360;
      const px = w / 2 + (dAz / fovH) * w;
      const py = h / 2 - ((vc.altitude - panY) / fovV) * h;
      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < minDist) {
        minDist = dist;
        closest = vc.constellation;
      }
    }
    setSelected(closest);
    setHighlightedConstellation(closest?.id ?? null);
  }, [visibleConst, panX, panY, zoom]);

  const timeStr = simDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = simDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="relative z-10 pt-16 h-screen flex flex-col">
        {/* Top bar */}
        <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl px-4 py-2">
          <div className="container flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{location.latitude.toFixed(1)}°N, {Math.abs(location.longitude).toFixed(1)}°W</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{timeStr} · {dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Moon className="w-3.5 h-3.5" />
              <span className="text-xs">{skyConditions.moonPhase}</span>
            </div>

            <div className="flex items-center gap-1 ml-auto">
              {[
                { label: "Lines", icon: Eye, state: showLines, set: setShowLines },
                { label: "Labels", icon: Tag, state: showLabels, set: setShowLabels },
                { label: "DSO", icon: Sparkles, state: showDeepSky, set: setShowDeepSky },
                { label: "Grid", icon: Grid3X3, state: showGrid, set: setShowGrid },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">{t.label}</span>
                  <Switch checked={t.state} onCheckedChange={t.set} className="scale-[0.65]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onClick={handleCanvasClick}
          />

          {/* Time controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card p-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setTimeSpeed(s => Math.max(10, s / 2))}>
              <SkipBack className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPlaying(!playing)}>
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setTimeSpeed(s => Math.min(3600, s * 2))}>
              <SkipForward className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground w-12 text-center">
              {timeSpeed < 60 ? `${timeSpeed}s` : timeSpeed < 3600 ? `${timeSpeed / 60}m` : `${timeSpeed / 3600}h`}/tick
            </span>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setSimDate(new Date()); setPlaying(false); }}>
              Now
            </Button>
          </div>

          {/* Zoom control */}
          <div className="absolute bottom-6 right-6 glass-card p-3 flex items-center gap-2 w-40">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <Slider
              value={[zoom * 20]}
              onValueChange={([v]) => setZoom(v / 20)}
              min={10} max={100} step={1}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground w-8">{zoom.toFixed(1)}×</span>
          </div>

          {/* Constellation highlight buttons */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[200px]">
            {visibleConst.filter(v => v.isVisible && v.altitude > 15).slice(0, 6).map(vc => (
              <Button
                key={vc.constellation.id}
                size="sm"
                variant={highlightedConstellation === vc.constellation.id ? "default" : "outline"}
                className={`text-[10px] h-6 px-2 ${
                  highlightedConstellation === vc.constellation.id
                    ? "btn-glow"
                    : "border-border/50 bg-background/60 backdrop-blur"
                }`}
                onClick={() => {
                  const next = highlightedConstellation === vc.constellation.id ? null : vc.constellation.id;
                  setHighlightedConstellation(next);
                  if (next) {
                    setPanX(vc.azimuth);
                    setPanY(Math.max(15, vc.altitude));
                    setSelected(vc.constellation);
                  } else {
                    setSelected(null);
                  }
                }}
              >
                {vc.constellation.name}
              </Button>
            ))}
          </div>

          {/* Selected constellation panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="absolute top-3 right-3 glass-card p-4 w-64 max-h-[60vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-bold text-base">{selected.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{selected.alternateNames[0]}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="w-5 h-5" onClick={() => { setSelected(null); setHighlightedConstellation(null); }}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="text-[10px] bg-muted/50 border-0">{selected.bestSeason}</Badge>
                    <Badge variant="secondary" className="text-[10px] bg-muted/50 border-0 capitalize">{selected.hemisphere}</Badge>
                    {selected.difficulty && (
                      <Badge variant="secondary" className="text-[10px] bg-muted/50 border-0">
                        {"★".repeat(selected.difficulty)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-foreground/70 leading-relaxed">{selected.spottingTips}</p>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Key Stars</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.stars.sort((a, b) => a.magnitude - b.magnitude).slice(0, 4).map(s => (
                        <Badge key={s.name} variant="outline" className="text-[10px] border-border/50">{s.name}</Badge>
                      ))}
                    </div>
                  </div>
                  {selected.deepSkyObjects.length > 0 && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Deep Sky Objects</p>
                      {selected.deepSkyObjects.map(o => (
                        <p key={o.name} className="text-foreground/60">{o.name}</p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
