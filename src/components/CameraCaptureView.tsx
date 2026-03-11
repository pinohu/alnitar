/**
 * CameraCaptureView — open device camera and capture a single photo for recognition.
 * "Take Photo" uses this instead of the file picker.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CameraCaptureViewProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCaptureView({ onCapture, onClose }: CameraCaptureViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setError(null);
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch(() => {});
            setReady(true);
          };
        }
      })
      .catch((err) => {
        setError(err.message || "Camera access denied. Allow camera access to take a photo.");
      });
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current || video.readyState < 2) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "cosmic-capture.jpg", { type: "image/jpeg" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.92
    );
  }, [onCapture, onClose]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black min-h-[50vh]">
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-auto max-h-[70vh] object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-background/95">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-sm text-center text-muted-foreground max-w-sm">{error}</p>
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
        </div>
      )}

      {ready && !error && (
        <>
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
            <span className="text-xs font-medium text-white/90 bg-black/50 px-2 py-1 rounded">
              Point at the night sky
            </span>
            <Button variant="secondary" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button size="lg" className="btn-glow rounded-full h-14 w-14 p-0" onClick={capture}>
              <Camera className="w-7 h-7" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
