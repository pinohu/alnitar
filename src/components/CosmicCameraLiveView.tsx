/**
 * CosmicCameraLiveView — real-time constellation identification and AR overlay on live camera.
 * Draws constellation lines and galactic (DSO) labels with confidence %.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, AlertCircle, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recognizeFrame, type RecognitionOutput, type RecognitionContext } from "@/lib/recognition";
import { getTonightSkyData } from "@/lib/tonight";
import { useGeolocation } from "@/hooks/use-geolocation";
import { deepSkyCatalog } from "@/data/deepSkyObjects";
import { getSkyCameraStream } from "@/lib/camera";

const CAPTURE_INTERVAL_MS = 1000;
const MAX_FRAME_DIM = 640;

function getStarBbox(positions: { x: number; y: number }[]): { minX: number; minY: number; w: number; h: number } {
  if (positions.length === 0) return { minX: 0, minY: 0, w: 1, h: 1 };
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const p of positions) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const pad = 0.05;
  const w = Math.max(0.1, maxX - minX + pad * 2);
  const h = Math.max(0.1, maxY - minY + pad * 2);
  return { minX: minX - pad, minY: minY - pad, w, h };
}

function drawAROverlay(
  ctx: CanvasRenderingContext2D,
  output: RecognitionOutput,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const top = output.results[0];
  if (!top || output.noConstellationFound) {
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    const msg = output.noMatchMessage ?? "Point at night sky";
    ctx.strokeText(msg, canvasWidth / 2, canvasHeight / 2);
    ctx.fillText(msg, canvasWidth / 2, canvasHeight / 2);
    return;
  }

  const { constellation, confidence } = top;
  const bbox = getStarBbox(output.starPositions);

  // Constellation lines: map diagram coords (0–1) to bbox in image space
  ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  const stars = constellation.stars;
  for (const [a, b] of constellation.lines) {
    if (!stars[a] || !stars[b]) continue;
    const x1 = (bbox.minX + stars[a].x * bbox.w) * canvasWidth;
    const y1 = (bbox.minY + stars[a].y * bbox.h) * canvasHeight;
    const x2 = (bbox.minX + stars[b].x * bbox.w) * canvasWidth;
    const y2 = (bbox.minY + stars[b].y * bbox.h) * canvasHeight;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Star dots at detected positions
  for (const sp of output.starPositions.slice(0, 20)) {
    const x = sp.x * canvasWidth;
    const y = sp.y * canvasHeight;
    const r = Math.max(1.5, sp.brightness * 4);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.7 * sp.brightness})`;
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Confidence badge (top-left)
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(12, 12, 130, 44);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, 130, 44);
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "left";
  ctx.fillText(constellation.name, 20, 32);
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.fillStyle = "rgba(56, 189, 248, 1)";
  ctx.fillText(`${confidence}% match`, 20, 48);

  // Secondary matches (small pills)
  output.results.slice(1, 3).forEach((r, i) => {
    const x = canvasWidth - 14 - (i * 72);
    const y = 28;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x - 62, y - 12, 62, 24);
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "right";
    ctx.fillText(`${r.constellation.name} ${r.confidence}%`, x - 8, y + 4);
  });
}

export interface CosmicCameraLiveViewProps {
  onClose?: () => void;
}

export function CosmicCameraLiveView({ onClose }: CosmicCameraLiveViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastCaptureRef = useRef<number>(0);

  const [output, setOutput] = useState<RecognitionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const { latitude, longitude } = useGeolocation();

  const captureAndRecognize = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || video.readyState < 2 || !streamActive) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const now = new Date();
    const context: RecognitionContext = {
      latitude,
      longitude,
      date: now,
      visibleConstellationIds: getTonightSkyData(now, latitude, longitude).bestConstellations.map((c) => c.id),
    };

    let captureCanvas = captureCanvasRef.current;
    if (!captureCanvas) {
      captureCanvas = document.createElement("canvas");
      captureCanvasRef.current = captureCanvas;
    }
    const scale = Math.min(1, MAX_FRAME_DIM / Math.max(w, h));
    captureCanvas.width = Math.round(w * scale);
    captureCanvas.height = Math.round(h * scale);
    const ctx = captureCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const imageData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
    const result = recognizeFrame(imageData, captureCanvas.width, captureCanvas.height, context);
    setOutput(result);

    // Draw overlay to match video display size (overlay may be CSS-scaled)
    overlay.width = w;
    overlay.height = h;
    const overlayCtx = overlay.getContext("2d");
    if (overlayCtx) {
      drawAROverlay(overlayCtx, result, w, h);
    }
  }, [streamActive, latitude, longitude]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const tick = () => {
      const now = performance.now();
      if (now - lastCaptureRef.current >= CAPTURE_INTERVAL_MS) {
        lastCaptureRef.current = now;
        captureAndRecognize();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    if (streamActive) {
      rafRef.current = requestAnimationFrame(tick);
      intervalId = setInterval(captureAndRecognize, CAPTURE_INTERVAL_MS);
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(intervalId);
    };
  }, [streamActive, captureAndRecognize]);

  useEffect(() => {
    setError(null);
    getSkyCameraStream()
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch(() => {});
            setStreamActive(true);
          };
        }
      })
      .catch((err) => {
        setError(err.message || "Camera access denied. Use the back camera and allow access for sky view.");
      });
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStreamActive(false);
    };
  }, []);

  const top = output?.results[0];
  const constellation = top?.constellation;
  const nearbyDSOs = constellation
    ? deepSkyCatalog.filter((d) => d.constellation === constellation.id).slice(0, 4)
    : [];

  return (
    <div className="relative w-full h-full min-h-[60vh] bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-background/95">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-sm text-center text-muted-foreground max-w-sm">{error}</p>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Back
            </Button>
          )}
        </div>
      )}

      {/* Top bar: Live indicator */}
      {streamActive && !error && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
          {onClose && (
            <Button variant="secondary" size="sm" className="rounded-full" onClick={onClose}>
              <VideoOff className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Bottom: DSO / galactic labels when constellation matched */}
      {streamActive && !error && constellation && nearbyDSOs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-3 right-3 flex flex-wrap gap-2 justify-center"
        >
          {nearbyDSOs.map((dso) => (
            <span
              key={dso.id}
              className="px-2.5 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-medium"
            >
              {dso.catalog} — {dso.type}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
