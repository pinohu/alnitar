import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, Loader2, AlertCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { recognizeImage, type RecognitionOutput } from "@/lib/recognition";
import { trackEvent } from "@/lib/analytics";
import { CosmicReveal } from "@/components/CosmicReveal";
import { SkyStoryMode } from "@/components/SkyStoryMode";
import { type Constellation } from "@/data/constellations";

export default function RecognizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecognitionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [storyConstellation, setStoryConstellation] = useState<Constellation | null>(null);

  const handleFile = useCallback(async (f: File) => {
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
      const output = await recognizeImage(f);
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
  }, []);

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
            <p className="text-muted-foreground mb-8">
              Point. Capture. Discover what's hidden in your sky.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Sky Story Mode */}
            {storyConstellation && results && (
              <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SkyStoryMode
                  output={results}
                  onClose={() => setStoryConstellation(null)}
                />
              </motion.div>
            )}

            {/* Upload zone */}
            {!results && !loading && !storyConstellation && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`glass-card border-2 border-dashed p-12 sm:p-16 text-center cursor-pointer transition-all ${
                    dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <Camera className="w-14 h-14 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Point at the sky & capture
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Take a photo or drop an image · Alnitar reveals what's hidden
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="default" size="sm" className="btn-glow">
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/50">
                      <Image className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
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
            {loading && (
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

            {/* Cosmic Reveal */}
            {results && !storyConstellation && (
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
