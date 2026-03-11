import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, Loader2, AlertCircle, Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { recognizeImage, type RecognitionOutput } from "@/lib/recognition";
import { trackEvent } from "@/lib/analytics";
import { CosmicReveal } from "@/components/CosmicReveal";
import { CosmicCameraLiveView } from "@/components/CosmicCameraLiveView";
import { CameraCaptureView } from "@/components/CameraCaptureView";
import { SkyStoryMode } from "@/components/SkyStoryMode";
import { RegisterGate } from "@/components/RegisterGate";
import { useAuth } from "@/contexts/AuthContext";
import {
  canGuestRecognize,
  incrementGuestRecognitionCount,
  getGuestRecognitionCount,
  GUEST_RECOGNITION_LIMIT_PER_DAY,
} from "@/lib/featureAccess";
import { type Constellation } from "@/data/constellations";
import { useGeolocation } from "@/hooks/use-geolocation";
import { usePageTitle } from "@/hooks/use-page-title";
import { getTonightSkyData } from "@/lib/tonight";

export default function RecognizePage() {
  usePageTitle(
    "Cosmic Camera",
    "Upload a sky photo or use live camera to identify constellations and deep-sky objects with confidence scores and overlays."
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecognitionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [storyConstellation, setStoryConstellation] = useState<Constellation | null>(null);
  const [mode, setMode] = useState<"upload" | "live">("upload");
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const { user } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const guestCount = getGuestRecognitionCount();
  const atLimit = !user && !canGuestRecognize();

  const handleFile = useCallback(async (f: File) => {
    if (atLimit) return;
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setResults(null);
    setStoryConstellation(null);
    setLoading(true);
    trackEvent("upload_started", { fileSize: f.size, fileType: f.type });

    try {
      const now = new Date();
      const tonight = getTonightSkyData(now, latitude, longitude);
      const visibleConstellationIds = tonight.bestConstellations.map((c) => c.id);
      const output = await recognizeImage(f, {
        latitude,
        longitude,
        date: now,
        visibleConstellationIds,
      });
      if (!user) incrementGuestRecognitionCount();
      setResults(output);
      trackEvent("recognition_completed", {
        starCount: output.detectedStarCount,
        topMatch: output.results[0]?.constellation.name,
        topConfidence: output.results[0]?.confidence,
      });
    } catch {
      setError("Recognition failed. Please try again with a different image.");
    } finally {
      setLoading(false);
    }
  }, [user, atLimit]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
    setStoryConstellation(null);
  };

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-7 h-7 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Cosmic <span className="gradient-text">Camera</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-4">
              Upload a sky photo or use live camera — we'll identify constellations and overlay them in real time with confidence %.
            </p>
            <div className="flex gap-2 mb-4">
              <Button
                variant={mode === "upload" ? "default" : "outline"}
                size="sm"
                className={mode === "upload" ? "btn-glow" : "border-border/50"}
                onClick={() => setMode("upload")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload photo
              </Button>
              <Button
                variant={mode === "live" ? "default" : "outline"}
                size="sm"
                className={mode === "live" ? "btn-glow" : "border-border/50"}
                onClick={() => setMode("live")}
              >
                <Video className="w-4 h-4 mr-2" />
                Live camera
              </Button>
            </div>
            {!user && (
              <p className="text-sm text-muted-foreground/90 mb-6">
                {guestCount < GUEST_RECOGNITION_LIMIT_PER_DAY
                  ? `${GUEST_RECOGNITION_LIMIT_PER_DAY - guestCount} of ${GUEST_RECOGNITION_LIMIT_PER_DAY} free scans left today. Create a free account for unlimited scans and cloud journal.`
                  : "You've used today's free scans. Create a free account for unlimited scans and to keep every observation in your journal."}
              </p>
            )}
          </motion.div>

          {atLimit && (
            <RegisterGate
              variant="card"
              title="You're clearly into the sky — take it to the next level"
              description={`You've used your ${GUEST_RECOGNITION_LIMIT_PER_DAY} free scans for today. Join thousands of stargazers with a free account: unlimited scans, cloud journal, and your progress saved everywhere.`}
              benefits={[
                "Unlimited Cosmic Camera — scan as many skies as you want",
                "Every discovery saved to your journal & the global network",
                "Personalized Tonight recommendations for your location",
                "Badges and progress that follow you on every device",
              ]}
            />
          )}

          <AnimatePresence mode="wait">
            {/* Live camera AR */}
            {mode === "live" && !atLimit && (
              <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <CosmicCameraLiveView onClose={() => setMode("upload")} />
                <p className="text-xs text-muted-foreground text-center">
                  Constellation lines and match % update in real time. Point at the night sky for best results.
                </p>
              </motion.div>
            )}

            {/* Sky Story Mode */}
            {mode === "upload" && storyConstellation && results && (
              <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SkyStoryMode
                  output={results}
                  onClose={() => setStoryConstellation(null)}
                />
              </motion.div>
            )}

            {/* Take Photo: device camera capture */}
            {mode === "upload" && showCameraCapture && !atLimit && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <CameraCaptureView
                  onCapture={(file) => {
                    setShowCameraCapture(false);
                    handleFile(file);
                  }}
                  onClose={() => setShowCameraCapture(false)}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Point your device at the night sky and tap the camera button to capture.
                </p>
              </motion.div>
            )}

            {/* Upload zone */}
            {mode === "upload" && !atLimit && !results && !loading && !storyConstellation && !showCameraCapture && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`glass-card border-2 border-dashed p-12 sm:p-16 text-center transition-all ${
                    dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"
                  }`}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <Camera className="w-14 h-14 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Point at the sky & capture
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Take a photo with your camera or upload an image · Alnitar reveals what's hidden
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="default"
                      size="sm"
                      className="btn-glow"
                      onClick={(e) => { e.stopPropagation(); setShowCameraCapture(true); }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/50"
                      onClick={(e) => { e.stopPropagation(); document.getElementById("file-input")?.click(); }}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">or drop an image here</p>
                </div>

                {error && (
                  <div className="glass-card mt-6 p-4 flex items-center gap-3 border-destructive/30">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Loading */}
            {mode === "upload" && loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-12 sm:p-16 text-center">
                <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="font-display text-lg font-semibold mb-2">Revealing your sky…</h3>
                <p className="text-sm text-muted-foreground">
                  Detecting stars · Matching patterns · Finding hidden objects
                </p>
                {preview && (
                  <div className="mt-6 rounded-lg overflow-hidden max-w-sm mx-auto opacity-50">
                    <img src={preview} alt="Uploaded sky" className="w-full" />
                  </div>
                )}
              </motion.div>
            )}

            {/* No constellation found (daytime / too few stars / not celestial) */}
            {mode === "upload" && results && results.noConstellationFound && (
              <motion.div key="no-match" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
                <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${results.notCelestialImage ? "text-amber-500" : "text-muted-foreground"}`} />
                <h3 className="font-display text-xl font-semibold mb-2">
                  {results.notCelestialImage ? "Not a celestial photo" : "No constellation identified"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {results.noMatchMessage ?? "Point your camera at a clear night sky with visible stars for best results."}
                </p>
                {!results.notCelestialImage && (
                  <p className="text-xs text-muted-foreground mb-4">
                    {results.detectedStarCount} star{results.detectedStarCount !== 1 ? "s" : ""} detected in this image.
                  </p>
                )}
                <Button onClick={reset} variant="outline" className="border-border/50">
                  {results.notCelestialImage ? "Use a night sky photo" : "Try another photo"}
                </Button>
              </motion.div>
            )}

            {/* Cosmic Reveal */}
            {mode === "upload" && results && !storyConstellation && !results.noConstellationFound && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <CosmicReveal
                  output={results}
                  imageUrl={preview}
                  onReset={reset}
                  onShowStory={(c) => setStoryConstellation(c)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
