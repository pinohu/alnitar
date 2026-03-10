import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { constellations } from "@/data/constellations";
import { equatorialToHorizontal, starCatalogService } from "@/lib/astronomy";
import type { ObserverLocation } from "@/lib/astronomy/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Clock, Play, Pause, SkipBack, SkipForward } from "lucide-react";

const DEFAULT_LOCATION: ObserverLocation = { latitude: 40.7, longitude: -74.0 };

// Proper motion simulation: stars shift over thousands of years
function applyProperMotion(ra: number, dec: number, yearOffset: number): { ra: number; dec: number } {
  // Simplified proper motion — stars drift slightly
  const drift = yearOffset * 0.00005;
  const hash = (ra * 17.3 + dec * 31.7) % 1;
  return {
    ra: ra + drift * Math.sin(hash * Math.PI * 2),
    dec: dec + drift * Math.cos(hash * Math.PI * 2) * 0.3,
  };
}

export default function SkyThroughTimePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [yearOffset, setYearOffset] = useState(0); // years from present
  const [playing, setPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(100); // years per tick
  const [panX, setPanX] = useState(180);
  const [panY, setPanY] = useState(45);
  const [zoom, setZoom] = useState(1);
  const location = DEFAULT_LOCATION;

  const currentYear = new Date().getFullYear() + yearOffset;
  const simDate = new Date();
  simDate.setFullYear(currentYear);

  const catalogStars = starCatalogService.getByMagnitudeLimit(6);

  // Animation
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setYearOffset(prev => prev + playSpeed);
    }, 100);
    return () => clearInterval(interval);
  }, [playing, playSpeed]);

  // Canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "hsl(222, 47%, 2%)");
      grad.addColorStop(0.5, "hsl(230, 45%, 6%)");
      grad.addColorStop(1, "hsl(222, 47%, 10%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const project = (alt: number, az: number) => {
        const fovH = 120 / zoom;
        const fovV = fovH * (h / w);
        let dAz = az - panX;
        if (dAz > 180) dAz -= 360;
        if (dAz < -180) dAz += 360;
        const x = w / 2 + (dAz / fovH) * w;
        const y = h / 2 - ((alt - panY) / fovV) * h;
        const visible = x > -50 && x < w + 50 && y > -50 && y < h + 50;
        return { x, y, visible };
      };

      // Stars with proper motion
      for (const star of catalogStars) {
        const { ra, dec } = applyProperMotion(star.ra, star.dec, yearOffset);
        const pos = equatorialToHorizontal(ra, dec, location, simDate);
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

        if (star.magnitude < 1.5 && zoom >= 0.8) {
          ctx.font = `${10 * zoom}px 'Space Grotesk', sans-serif`;
          ctx.fillStyle = "rgba(200, 220, 255, 0.7)";
          ctx.textAlign = "left";
          ctx.fillText(star.name, p.x + r + 4, p.y + 3);
        }
      }

      // Constellation lines with drift
      for (const c of constellations) {
        const raMatch = c.rightAscension.match(/(\d+)h\s*(\d+)m?/);
        const decMatch = c.declination.match(/([+-]?\d+)°/);
        const cRA = raMatch ? (parseInt(raMatch[1]) + parseInt(raMatch[2] || '0') / 60) * 15 : 0;
        const cDec = decMatch ? parseInt(decMatch[1]) : 0;

        const starPositions = c.stars.map(s => {
          const starRA = cRA + (s.x - 0.5) * 15;
          const starDec = cDec + (0.5 - s.y) * 15;
          const { ra, dec } = applyProperMotion(starRA, starDec, yearOffset);
          const pos = equatorialToHorizontal(ra, dec, location, simDate);
          return { proj: project(pos.altitude, pos.azimuth), alt: pos.altitude };
        });

        const anyVisible = starPositions.some(sp => sp.proj.visible && sp.alt > 0);
        if (!anyVisible) continue;

        // Lines
        ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
        ctx.lineWidth = 1 * zoom;
        for (const [a, b] of c.lines) {
          const sa = starPositions[a], sb = starPositions[b];
          if (!sa || !sb || !sa.proj.visible || !sb.proj.visible) continue;
          ctx.beginPath();
          ctx.moveTo(sa.proj.x, sa.proj.y);
          ctx.lineTo(sb.proj.x, sb.proj.y);
          ctx.stroke();
        }
      }

      // Year overlay
      ctx.font = "bold 24px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
      ctx.textAlign = "center";
      ctx.fillText(`Year ${currentYear.toLocaleString()}`, w / 2, 40);

      if (Math.abs(yearOffset) > 0) {
        ctx.font = "13px Inter, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillText(
          yearOffset > 0 ? `${yearOffset.toLocaleString()} years in the future` : `${Math.abs(yearOffset).toLocaleString()} years ago`,
          w / 2, 60
        );
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [panX, panY, zoom, yearOffset, catalogStars, location, simDate, currentYear]);

  // Pan handlers
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

  const handlePointerUp = useCallback(() => { isDragging.current = false; }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(5, prev * (1 - e.deltaY * 0.001))));
  }, []);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="relative z-10 pt-16 h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl px-4 py-2">
          <div className="container flex items-center gap-4">
            <Clock className="w-4 h-4 text-primary" />
            <h1 className="font-display font-bold text-sm">Your Sky Through Time</h1>
            <span className="text-xs text-muted-foreground ml-auto">
              Drag the timeline to see how stars shift over millennia
            </span>
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
          />

          {/* Timeline slider */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card p-4 w-[90%] max-w-lg">
            <div className="flex items-center gap-3 mb-3">
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setPlaySpeed(s => Math.max(10, s / 2))}>
                <SkipBack className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPlaying(!playing)}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setPlaySpeed(s => Math.min(5000, s * 2))}>
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
              <span className="text-[10px] text-muted-foreground">{playSpeed} yr/tick</span>
              <Button variant="ghost" size="sm" className="text-xs h-6 ml-auto" onClick={() => { setYearOffset(0); setPlaying(false); }}>
                Now
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-16 text-right">-50,000</span>
              <Slider
                value={[yearOffset]}
                onValueChange={([v]) => setYearOffset(v)}
                min={-50000}
                max={50000}
                step={100}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground w-16">+50,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
