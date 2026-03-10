import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { getTonightSkyData } from "@/lib/tonight";
import { getDiscoveryRecommendations } from "@/lib/discovery";
import { getLocalProgress } from "@/lib/gamification";
import { useAtmosphere } from "@/hooks/use-atmosphere";
import { useCountry } from "@/hooks/use-country";
import { weatherCodeLabel } from "@/lib/atmosphere";
import { getUnitSystem, formatTemperature, formatWind, formatVisibility, formatPressure } from "@/lib/units";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { DiscoveryPanel } from "@/components/DiscoveryPanel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Eye, Globe, Calendar, Gauge, MapPin, Loader2, Thermometer, Droplets, Cloud, Wind, Activity, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterGate } from "@/components/RegisterGate";
import { toast } from "sonner";
import { STORAGE_KEYS, getItem, setItem } from "@/lib/clientStorage";

function getStoredLocation(): { lat: number; lng: number } | null {
  const lat = getItem(STORAGE_KEYS.TONIGHT_LAT);
  const lng = getItem(STORAGE_KEYS.TONIGHT_LNG);
  if (lat != null && lng != null) {
    const latNum = Number.parseFloat(lat);
    const lngNum = Number.parseFloat(lng);
    if (Number.isFinite(latNum) && latNum >= -90 && latNum <= 90 && Number.isFinite(lngNum)) return { lat: latNum, lng: lngNum };
  }
  return null;
}

export default function TonightPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [latitude, setLatitude] = useState(() => {
    const stored = getStoredLocation();
    return stored ? stored.lat : 40;
  });
  const [longitude, setLongitude] = useState(() => {
    const stored = getStoredLocation();
    return stored ? stored.lng : 0;
  });
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLatitude(stored.lat);
      setLongitude(stored.lng);
      return;
    }
    if (!navigator.geolocation) return;
    const t = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 10) / 10;
          const lng = Math.round(pos.coords.longitude * 10) / 10;
          setLatitude(lat);
          setLongitude(lng);
          setItem(STORAGE_KEYS.TONIGHT_LAT, String(lat));
            setItem(STORAGE_KEYS.TONIGHT_LNG, String(lng));
          },
        () => {},
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10) / 10;
        const lng = Math.round(pos.coords.longitude * 10) / 10;
        setLatitude(lat);
        setLongitude(lng);
        setItem(STORAGE_KEYS.TONIGHT_LAT, String(lat));
        setItem(STORAGE_KEYS.TONIGHT_LNG, String(lng));
        setLocationLoading(false);
        toast.success("Location updated for tonight's sky.");
      },
      () => {
        setLocationLoading(false);
        toast.error("Could not get your location. Check permissions or enter it manually.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  };

  const observationTime = useMemo(() => new Date(date + "T20:00:00"), [date]);
  const data = useMemo(() => getTonightSkyData(observationTime, latitude), [observationTime, latitude]);
  const { loading: atmosphereLoading, error: atmosphereError, data: atmosphere } = useAtmosphere(latitude, longitude);
  const { countryCode } = useCountry(latitude, longitude);
  const unitSystem = getUnitSystem(countryCode);

  const discovery = useMemo(() => {
    const progress = getLocalProgress();
    return getDiscoveryRecommendations({
      latitude,
      longitude,
      date: observationTime,
      equipment: 'naked-eye',
      experienceLevel: 'beginner',
      constellationsFound: progress.constellationsFound,
      dsosObserved: [],
      totalObservations: progress.totalObservations,
    });
  }, [date, latitude, longitude, observationTime]);

  const scoreColor = data.skyScore >= 70 ? "text-green-400" : data.skyScore >= 40 ? "text-accent" : "text-destructive";

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Tonight's <span className="gradient-text">Sky</span>
            </h1>
            <p className="text-muted-foreground mb-4">Your personalized sky intelligence for tonight.</p>
            {!user && (
              <RegisterGate
                variant="banner"
                title="Make Tonight yours"
                description="Sign up to save your location and get recommendations based on what you've already found — so every night is perfectly tailored to you."
              />
            )}
          </motion.div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-40 bg-card/60 border-border/40 text-sm" aria-label="Date" />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input type="number" value={latitude} onChange={e => setLatitude(Number(e.target.value))}
                className="w-20 bg-card/60 border-border/40 text-sm" min={-90} max={90} step={0.1} placeholder="Lat" aria-label="Latitude" />
              <span className="text-xs text-muted-foreground">°</span>
              <Input type="number" value={longitude} onChange={e => setLongitude(Number(e.target.value))}
                className="w-20 bg-card/60 border-border/40 text-sm" min={-180} max={180} step={0.1} placeholder="Lng" aria-label="Longitude" />
              <span className="text-xs text-muted-foreground">°</span>
            </div>
            <Button type="button" variant="outline" size="sm" className="border-border/50 shrink-0" onClick={requestLocation} disabled={locationLoading}>
              {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              <span className="ml-1.5">{locationLoading ? "Getting…" : "Use my location"}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Showing for <strong>{date}</strong> at 8 PM · {latitude >= 0 ? `${latitude}°N` : `${-latitude}°S`}, {longitude >= 0 ? `${longitude}°E` : `${-longitude}°W`}. Change the date or location above to update.
          </p>

          {/* Sensed: location, time, atmosphere */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Sensed at your location</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
              <span><Globe className="w-3.5 h-3.5 inline mr-1" aria-hidden />{latitude.toFixed(1)}°, {longitude.toFixed(1)}°</span>
              <span aria-label="Local time"><Calendar className="w-3.5 h-3.5 inline mr-1" aria-hidden />{new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} local</span>
            </div>
            {atmosphereLoading && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sensing temperature, humidity & conditions…</p>
            )}
            {atmosphereError && (
              <p className="text-xs text-destructive">{atmosphereError}</p>
            )}
            {atmosphere && !atmosphereLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                <div className="glass-card p-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-primary shrink-0" />
                  <div><span className="font-semibold tabular-nums">{formatTemperature(atmosphere.temperatureC, unitSystem)}</span><span className="text-muted-foreground block text-[10px]">Temp</span></div>
                </div>
                <div className="glass-card p-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary shrink-0" />
                  <div><span className="font-semibold tabular-nums">{atmosphere.humidityPercent}%</span><span className="text-muted-foreground block text-[10px]">Humidity</span></div>
                </div>
                <div className="glass-card p-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary shrink-0" />
                  <div><span className="font-semibold tabular-nums">{formatPressure(atmosphere.pressureHpa, unitSystem)}</span><span className="text-muted-foreground block text-[10px]">Pressure</span></div>
                </div>
                <div className="glass-card p-3 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-primary shrink-0" />
                  <div><span className="font-semibold tabular-nums">{atmosphere.cloudCoverPercent}%</span><span className="text-muted-foreground block text-[10px]">Clouds</span></div>
                </div>
                <div className="glass-card p-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary shrink-0" />
                  <div><span className="font-semibold tabular-nums">{formatVisibility(atmosphere.visibilityKm, unitSystem)}</span><span className="text-muted-foreground block text-[10px]">Visibility</span></div>
                </div>
                <div className="glass-card p-3 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-primary shrink-0" />
                  <div><span className="font-semibold tabular-nums">{formatWind(atmosphere.windSpeedKmh, unitSystem)}</span><span className="text-muted-foreground block text-[10px]">Wind</span></div>
                </div>
                <div className="glass-card p-3 flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Sun className="w-4 h-4 text-primary shrink-0" aria-hidden />
                  <div><span className="font-semibold">{weatherCodeLabel(atmosphere.weatherCode)}</span><span className="text-muted-foreground block text-[10px]">Conditions</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Sky Score + Moon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 text-center">
              <Gauge className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className={`text-4xl font-display font-bold ${scoreColor}`}>{data.skyScore}</div>
              <p className="text-xs text-muted-foreground mt-1">Tonight's Sky Score</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center">
              <Moon className="w-6 h-6 mx-auto mb-2 text-accent" />
              <div className="text-lg font-display font-bold">{data.moonPhase}</div>
              <p className="text-xs text-muted-foreground mt-1">{data.moonBrightness}% brightness</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
              <Eye className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <div className="text-lg font-display font-bold">{data.darkness}%</div>
              <p className="text-xs text-muted-foreground mt-1">Sky Darkness</p>
            </motion.div>
          </div>

          {/* Discovery Engine */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DiscoveryPanel result={discovery} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
