/**
 * Event simulation — e.g. lunar eclipse (moon passing through shadow). Simple 2D visualization.
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Sun } from "lucide-react";

export default function EventSimulatePage() {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const sunR = Math.min(w, h) * 0.2;
    const moonR = sunR * 0.35;
    const moonOffset = (phase - 0.5) * w * 0.7;

    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(0, 0, sunR + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, sunR, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();

    ctx.translate(moonOffset, 0);
    ctx.beginPath();
    ctx.arc(0, 0, moonR, 0, Math.PI * 2);
    ctx.fillStyle = "#64748b";
    ctx.fill();
    ctx.restore();
  }, [phase]);

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
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-4">
            <Link to="/events">
              <Button variant="ghost" size="icon" aria-label="Back to Events">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Simulate: Lunar eclipse</h1>
              <p className="text-sm text-muted-foreground">Moon passes through Earth&apos;s shadow. Drag to see the sequence.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Sun className="w-4 h-4" /> Sun (yellow) · Moon (gray) moves across
            </div>
            <canvas ref={canvasRef} className="w-full h-[280px] block" />
            <div className="p-4 border-t border-border/40 space-y-2">
              <label className="text-xs text-muted-foreground">Eclipse phase (0 = start, 1 = end)</label>
              <Slider value={[phase]} onValueChange={([v]) => setPhase(v)} max={1} step={0.01} className="w-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
