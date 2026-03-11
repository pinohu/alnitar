import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass, AlertCircle, Video, VideoOff, MapPin, X, Info,
} from "lucide-react";
import {
  isDeviceOrientationSupported,
  requestOrientationPermission,
  getAROverlayObjects,
  type AROverlayObject,
} from "@/lib/astronomy/arOverlay";
import type { DeviceOrientation, ObserverLocation } from "@/lib/astronomy/types";
import { trackEvent } from "@/lib/analytics";

const DEFAULT_LOCATION: ObserverLocation = { latitude: 40.7, longitude: -74.0 };

export default function LiveSkyPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSupported] = useState(isDeviceOrientationSupported());
  const [orientation, setOrientation] = useState<DeviceOrientation>({ alpha: 0, beta: 90, gamma: 0 });
  const [location] = useState(DEFAULT_LOCATION);
  const [objects, setObjects] = useState<AROverlayObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<AROverlayObject | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [overlayTime, setOverlayTime] = useState(() => new Date());
  const simInterval = useRef<number>(0);

  useEffect(() => { trackEvent("live_sky_opened"); }, []);

  // When tracking a planet, update overlay time every second so position stays current
  const isTrackingMovingObject = selectedObject?.type === 'planet';
  useEffect(() => {
    if (selectedObject?.type === 'planet') setOverlayTime(new Date());
  }, [selectedObject?.id, selectedObject?.type]);
  useEffect(() => {
    if (!isTrackingMovingObject) return;
    const interval = window.setInterval(() => setOverlayTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isTrackingMovingObject]);

  // Request sensor permission
  const requestPermission = useCallback(async () => {
    const granted = await requestOrientationPermission();
    setHasPermission(granted);
    if (granted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    setOrientation({
      alpha: e.alpha ?? 0,
      beta: e.beta ?? 90,
      gamma: e.gamma ?? 0,
    });
  }, []);

  // Update visible objects (use overlayTime when tracking a planet so position updates)
  useEffect(() => {
    const time = isTrackingMovingObject ? overlayTime : new Date();
    const visible = getAROverlayObjects(orientation, location, time);
    setObjects(visible);
  }, [orientation, location, overlayTime, isTrackingMovingObject]);

  // Simulation mode — slowly rotate the view
  useEffect(() => {
    if (!simulationMode) {
      clearInterval(simInterval.current);
      return;
    }
    const start = Date.now();
    simInterval.current = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setOrientation({
        alpha: (elapsed * 5) % 360,
        beta: 60 + Math.sin(elapsed * 0.3) * 20,
        gamma: Math.sin(elapsed * 0.5) * 10,
      });
    }, 50);
    return () => clearInterval(simInterval.current);
  }, [simulationMode]);

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      clearInterval(simInterval.current);
    };
  }, [handleOrientation]);

  const compassDir = ((360 - orientation.alpha + 360) % 360);
  const cardinalDirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const cardinalIdx = Math.round(compassDir / 45) % 8;

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="relative z-10 pt-16 h-screen flex flex-col">
        {/* Status bar */}
        <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl px-4 py-2">
          <div className="container flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Compass className="w-4 h-4 text-primary" style={{ transform: `rotate(${-compassDir}deg)` }} />
              <span className="font-mono text-xs">{cardinalDirs[cardinalIdx]} {compassDir.toFixed(0)}°</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{location.latitude.toFixed(1)}°N</span>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              {objects.length} objects in view
            </span>
          </div>
        </div>

        {/* Main AR view */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[hsl(222,47%,2%)] via-[hsl(230,45%,6%)] to-[hsl(222,47%,10%)]">
          {/* Permission / support gate */}
          {!isSupported && !simulationMode && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="glass-card p-8 max-w-md text-center">
                <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                <h2 className="font-display text-xl font-bold mb-2">Device Sensors Not Available</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Sky overlay uses device orientation (gyroscope, accelerometer, compass). No camera is used on this page.
                  Works best on mobile devices with motion sensors.
                </p>
                <Button onClick={() => setSimulationMode(true)} className="btn-glow">
                  Try Simulation Mode
                </Button>
              </div>
            </div>
          )}

          {isSupported && hasPermission === null && !simulationMode && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="glass-card p-8 max-w-md text-center">
                <Compass className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="font-display text-xl font-bold mb-2">Enable Sky Overlay</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  This view uses your device&apos;s orientation sensors (gyroscope, accelerometer, compass) only — no camera.
                  Point your phone at the sky to see constellation and planet labels over a simulated starfield.
                  For a live camera view with AR overlay, use Cosmic Camera from the Recognize page.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={requestPermission} className="btn-glow">
                    Enable Sensors
                  </Button>
                  <Button variant="outline" onClick={() => setSimulationMode(true)} className="border-border/50">
                    Simulation Mode
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AR overlay objects */}
          {(hasPermission || simulationMode) && (
            <>
              {/* Background stars */}
              {Array.from({ length: 100 }, (_, i) => {
                const x = (Math.sin(i * 127.1 + orientation.alpha * 0.01) * 0.5 + 0.5) * 100;
                const y = (Math.sin(i * 269.5 + orientation.beta * 0.01) * 0.5 + 0.5) * 100;
                const r = Math.sin(i * 17.3) * 0.5 + 0.8;
                const twinkle = Math.sin(Date.now() * 0.002 + i * 5) * 0.3 + 0.7;
                return (
                  <div
                    key={i}
                    className="absolute rounded-full bg-foreground/20"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${r}px`,
                      height: `${r}px`,
                      opacity: 0.1 * twinkle,
                    }}
                  />
                );
              })}

              {/* AR overlay labels */}
              {objects.map((obj) => (
                <motion.button
                  key={obj.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${obj.screenX * 100}%`,
                    top: `${obj.screenY * 100}%`,
                  }}
                  onClick={() => setSelectedObject(obj)}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    obj.type === 'constellation' ? 'bg-primary/80 shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                    : obj.type === 'planet' ? 'bg-accent/80 shadow-[0_0_8px_hsl(var(--accent)/0.5)]'
                    : 'bg-secondary/80 shadow-[0_0_8px_hsl(var(--secondary)/0.5)]'
                  }`} />
                  <span className={`text-[10px] font-medium whitespace-nowrap ${
                    obj.type === 'constellation' ? 'text-primary'
                    : obj.type === 'planet' ? 'text-accent'
                    : 'text-secondary'
                  }`}>
                    {obj.name}
                  </span>
                </motion.button>
              ))}

              {/* Simulation mode indicator */}
              {simulationMode && (
                <div className="absolute top-3 left-3 glass-card px-3 py-1.5 flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] text-accent font-medium">Simulation Mode</span>
                  <Button variant="ghost" size="icon" className="w-5 h-5" onClick={() => setSimulationMode(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Compass overlay */}
              <div className="absolute bottom-6 left-6 glass-card p-3 w-20 h-20 flex items-center justify-center">
                <div className="relative w-14 h-14" style={{ transform: `rotate(${-compassDir}deg)` }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-destructive" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[7px] border-t-muted-foreground/30" />
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-destructive" style={{ transform: `rotate(${compassDir}deg)` }}>N</span>
                </div>
              </div>

              {/* Altitude indicator */}
              <div className="absolute bottom-6 right-6 glass-card px-3 py-2">
                <span className="text-[10px] text-muted-foreground">Alt</span>
                <span className="text-sm font-mono text-foreground ml-2">{Math.round(orientation.beta - 90 + 90)}°</span>
              </div>
            </>
          )}

          {/* Object detail panel */}
          <AnimatePresence>
            {selectedObject && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-24 left-4 right-4 glass-card p-4 max-w-md mx-auto"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-sm">{selectedObject.name}</h3>
                    <Badge variant="secondary" className="text-[10px] capitalize bg-muted/50 border-0">
                      {selectedObject.type}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="w-5 h-5" onClick={() => setSelectedObject(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {selectedObject.description && (
                  <p className="text-xs text-foreground/70 leading-relaxed mb-2">{selectedObject.description}</p>
                )}
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>Alt: {selectedObject.altitude.toFixed(1)}°</span>
                  <span>Az: {selectedObject.azimuth.toFixed(1)}°</span>
                  {selectedObject.magnitude !== undefined && <span>Mag: {selectedObject.magnitude.toFixed(1)}</span>}
                </div>
                {selectedObject.type === 'planet' && (
                  <p className="text-[10px] text-primary mt-2">Position updates in real time while selected.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
