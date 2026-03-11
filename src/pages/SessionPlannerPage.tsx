// src/pages/SessionPlannerPage.tsx — Expert session planner: equipment, time window, goal → ranked list (Pro)
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessProFeatures } from "@/lib/featureAccess";
import { ProGate } from "@/components/ProGate";
import { getDiscoveryRecommendations } from "@/lib/discovery";
import { getLocalProgress } from "@/lib/gamification";
import { getItem, STORAGE_KEYS } from "@/lib/clientStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { constellations } from "@/data/constellations";
import type { Recommendation } from "@/lib/discovery/types";
import { Calendar, Clock, Telescope, Target, Play, ArrowRight } from "lucide-react";
import { setItem } from "@/lib/clientStorage";

const EQUIPMENT_OPTIONS = [
  { value: "naked-eye" as const, label: "Naked eye" },
  { value: "binoculars" as const, label: "Binoculars" },
  { value: "telescope" as const, label: "Telescope" },
];

const GOAL_OPTIONS = [
  { value: "easy" as const, label: "Easy wins (beginner)" },
  { value: "dsos" as const, label: "Deep-sky objects" },
  { value: "mixed" as const, label: "Mixed (best tonight)" },
];

const TIME_WINDOWS = [
  { value: "90", label: "Next 90 min" },
  { value: "20-22", label: "8–10 PM" },
  { value: "22-24", label: "10 PM–midnight" },
];

function RecCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const constellation = constellations.find((c) => c.id === rec.objectId);
  const linkTo = rec.objectType === "constellation" && constellation ? `/learn/${constellation.slug}` : "/tonight";

  return (
    <Link to={linkTo} className="glass-card p-4 flex gap-3 items-center hover:border-primary/30 transition-colors">
      <span className="text-lg font-display font-bold text-muted-foreground w-6">{rank}</span>
      {constellation && (
        <div className="shrink-0 rounded bg-muted/20">
          <ConstellationDiagram constellation={constellation} width={48} height={48} />
        </div>
      )}
      {!constellation && (
        <div className="shrink-0 w-12 h-12 rounded bg-muted/20 flex items-center justify-center">
          <Telescope className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-sm">{rec.objectName}</p>
        <p className="text-xs text-muted-foreground truncate">{rec.reason}</p>
        <div className="flex gap-1.5 mt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {rec.difficulty}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{rec.bestViewingTime}</span>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </Link>
  );
}

export default function SessionPlannerPage() {
  const { user } = useAuth();
  const storedLat = getItem(STORAGE_KEYS.TONIGHT_LAT);
  const storedLng = getItem(STORAGE_KEYS.TONIGHT_LNG);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [timeWindow, setTimeWindow] = useState("90");
  const [equipment, setEquipment] = useState<"naked-eye" | "binoculars" | "telescope">("naked-eye");
  const [goal, setGoal] = useState<"easy" | "dsos" | "mixed">("mixed");

  const lat = storedLat != null && Number.isFinite(Number(storedLat)) ? Number(storedLat) : 40;
  const lng = storedLng != null && Number.isFinite(Number(storedLng)) ? Number(storedLng) : 0;
  const observationTime = useMemo(() => new Date(date + "T20:00:00"), [date]);
  const progress = getLocalProgress();

  const discovery = useMemo(
    () =>
      getDiscoveryRecommendations({
        latitude: lat,
        longitude: lng,
        date: observationTime,
        equipment,
        experienceLevel: "beginner",
        constellationsFound: progress.constellationsFound,
        dsosObserved: [],
        totalObservations: progress.totalObservations,
      }),
    [lat, lng, observationTime, equipment, progress.constellationsFound, progress.totalObservations]
  );

  const sessionPlan = useMemo(() => {
    let list: Recommendation[] = [];
    if (goal === "easy") {
      list = [...discovery.beginnerPicks, ...discovery.topPicks.filter((r) => r.difficulty === "Easy")];
    } else if (goal === "dsos") {
      list = [...discovery.deepSkyPicks, ...discovery.binocularPicks];
    } else {
      list = [...discovery.topPicks, ...discovery.beginnerPicks, ...discovery.binocularPicks];
    }
    const seen = new Set<string>();
    return list.filter((r) => {
      if (seen.has(r.objectId)) return false;
      seen.add(r.objectId);
      return true;
    }).slice(0, 12);
  }, [discovery, goal]);

  const startSession = () => {
    setItem("alnitar_session_start", new Date().toISOString());
    setItem("alnitar_session_plan", JSON.stringify(sessionPlan.map((r) => r.objectId)));
  };

  if (!canAccessProFeatures(user)) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 pb-16 px-4">
          <div className="container max-w-2xl">
            <ProGate title="Session Planner" description="Plan your observing session by equipment, time window, and goal. Part of Alnitar Pro." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold mb-2">
              Session <span className="gradient-text">Planner</span>
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              What to look at in your next time window, with your gear. One tap to start.
            </p>

            <div className="glass-card p-4 mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5" /> Time window
                  </label>
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {TIME_WINDOWS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                    <Telescope className="w-3.5 h-3.5" /> Equipment
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as "naked-eye" | "binoculars" | "telescope")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {EQUIPMENT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                    <Target className="w-3.5 h-3.5" /> Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as "easy" | "dsos" | "mixed")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {GOAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Location: {lat}°, {lng}°. <Link to="/tonight" className="text-primary hover:underline">Set on Tonight's Sky</Link>
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Your session plan</h2>
              <Button size="sm" className="btn-glow" onClick={startSession} asChild>
                <Link to="/tonight">
                  <Play className="w-4 h-4 mr-1" />
                  Start session
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              {sessionPlan.map((rec, i) => (
                <RecCard key={rec.id} rec={rec} rank={i + 1} />
              ))}
            </div>
            {sessionPlan.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No targets for this combination. Try a different date or goal.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
