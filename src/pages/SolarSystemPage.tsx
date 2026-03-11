/**
 * Solar system orrery — 2D view of orbits (sun + inner planets). Foundation for future 3D WebGL.
 */

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ORBIT_PERIODS_DAYS = [0, 88, 225, 365, 687];
const ORBIT_RADII = [0, 45, 70, 100, 145];
const PLANET_NAMES = ["Sun", "Mercury", "Venus", "Earth", "Mars"];
const PLANET_COLORS = ["#fbbf24", "#94a3b8", "#e8d5b7", "#60a5fa", "#f87171"];

export default function SolarSystemPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio ?? 1;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 320;

    const loop = () => {
      ctx.fillStyle = "rgba(7, 2, 18, 0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      for (let i = 0; i < ORBIT_RADII.length; i++) {
        const r = ORBIT_RADII[i];
        if (r === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fillStyle = PLANET_COLORS[i];
          ctx.fill();
          continue;
        }
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        const angle = (time / ORBIT_PERIODS_DAYS[i]) * Math.PI * 2;
        const x = r * Math.cos(angle);
        const y = r * 0.4 * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, i === 1 ? 2 : i === 2 ? 3 : 4, 0, Math.PI * 2);
        ctx.fillStyle = PLANET_COLORS[i];
        ctx.fill();
      }
      ctx.restore();
    };

    loop();
  }, [time]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio ?? 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-4">
            <Link to="/explore">
              <Button variant="ghost" size="icon" aria-label="Back to Explore">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Solar system orrery</h1>
              <p className="text-sm text-muted-foreground">Inner planets (not to scale). Drag the slider to advance time.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-[360px] block" style={{ background: "transparent" }} />
            <div className="p-4 border-t border-border/40">
              <label className="text-xs text-muted-foreground block mb-2">Days elapsed</label>
              <input
                type="range"
                min={0}
                max={687}
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary"
              />
              <span className="text-xs text-muted-foreground tabular-nums">{time} days</span>
            </div>
          </motion.div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Full 3D WebGL galaxy and solar system view coming in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
