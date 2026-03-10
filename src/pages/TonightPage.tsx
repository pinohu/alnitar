import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { getTonightSkyData } from "@/lib/tonight";
import { getDiscoveryRecommendations } from "@/lib/discovery";
import { getLocalProgress } from "@/lib/gamification";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { DiscoveryPanel } from "@/components/DiscoveryPanel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Moon, Eye, Globe, Calendar, Gauge } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterGate } from "@/components/RegisterGate";

export default function TonightPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [latitude, setLatitude] = useState(40);

  const data = useMemo(() => getTonightSkyData(new Date(date + "T20:00:00"), latitude), [date, latitude]);

  const discovery = useMemo(() => {
    const progress = getLocalProgress();
    return getDiscoveryRecommendations({
      latitude,
      longitude: 0,
      date: new Date(date + "T20:00:00"),
      equipment: 'naked-eye',
      experienceLevel: 'beginner',
      constellationsFound: progress.constellationsFound,
      dsosObserved: [],
      totalObservations: progress.totalObservations,
    });
  }, [date, latitude]);

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
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-40 bg-card/60 border-border/40 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Input type="number" value={latitude} onChange={e => setLatitude(Number(e.target.value))}
                className="w-24 bg-card/60 border-border/40 text-sm" min={-90} max={90} placeholder="Lat" />
              <span className="text-xs text-muted-foreground">°N</span>
            </div>
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
