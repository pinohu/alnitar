import { useEffect, useRef } from "react";

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface StarParticle {
      x: number; y: number; r: number; twinkleSpeed: number; twinkleOffset: number; opacity: number;
    }

    const stars: StarParticle[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      twinkleSpeed: Math.random() * 0.002 + 0.001,
      twinkleOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.3,
    }));

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = s.opacity + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${Math.max(0.05, Math.min(1, alpha))})`;
        ctx.fill();
        if (s.r > 1) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 210, 255, ${alpha * 0.1})`;
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-field" />;
}
