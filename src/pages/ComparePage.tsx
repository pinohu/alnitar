import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { constellations, type Constellation } from "@/data/constellations";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Star, Calendar, MapPin, Telescope, Gauge, BookOpen } from "lucide-react";

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= level ? "text-accent fill-accent" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function ComparePage() {
  const [leftId, setLeftId] = useState("orion");
  const [rightId, setRightId] = useState("scorpius");

  const left = useMemo(() => constellations.find(c => c.id === leftId)!, [leftId]);
  const right = useMemo(() => constellations.find(c => c.id === rightId)!, [rightId]);

  const rows: { label: string; icon: React.ElementType; leftVal: React.ReactNode; rightVal: React.ReactNode }[] = [
    {
      label: "Season",
      icon: Calendar,
      leftVal: <Badge variant="secondary" className="bg-muted/50 border-0">{left.bestSeason}</Badge>,
      rightVal: <Badge variant="secondary" className="bg-muted/50 border-0">{right.bestSeason}</Badge>,
    },
    {
      label: "Hemisphere",
      icon: MapPin,
      leftVal: <span className="capitalize text-sm">{left.hemisphere}</span>,
      rightVal: <span className="capitalize text-sm">{right.hemisphere}</span>,
    },
    {
      label: "Difficulty",
      icon: Gauge,
      leftVal: <DifficultyStars level={left.difficulty ?? 3} />,
      rightVal: <DifficultyStars level={right.difficulty ?? 3} />,
    },
    {
      label: "Sky Area",
      icon: Star,
      leftVal: <span className="text-sm">{left.area} sq°</span>,
      rightVal: <span className="text-sm">{right.area} sq°</span>,
    },
    {
      label: "Stars",
      icon: Star,
      leftVal: <span className="text-sm">{left.stars.length} stars</span>,
      rightVal: <span className="text-sm">{right.stars.length} stars</span>,
    },
    {
      label: "Brightest Star",
      icon: Star,
      leftVal: (
        <div className="text-sm">
          <span className="font-medium">{left.stars.sort((a,b) => a.magnitude - b.magnitude)[0]?.name}</span>
          <span className="text-muted-foreground ml-1">({left.stars.sort((a,b) => a.magnitude - b.magnitude)[0]?.magnitude.toFixed(1)}m)</span>
        </div>
      ),
      rightVal: (
        <div className="text-sm">
          <span className="font-medium">{right.stars.sort((a,b) => a.magnitude - b.magnitude)[0]?.name}</span>
          <span className="text-muted-foreground ml-1">({right.stars.sort((a,b) => a.magnitude - b.magnitude)[0]?.magnitude.toFixed(1)}m)</span>
        </div>
      ),
    },
    {
      label: "Deep Sky Objects",
      icon: Telescope,
      leftVal: <span className="text-sm">{left.deepSkyObjects.length} objects</span>,
      rightVal: <span className="text-sm">{right.deepSkyObjects.length} objects</span>,
    },
    {
      label: "Best Months",
      icon: Calendar,
      leftVal: <span className="text-xs text-muted-foreground">{left.bestMonths.join(", ")}</span>,
      rightVal: <span className="text-xs text-muted-foreground">{right.bestMonths.join(", ")}</span>,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Constellation <span className="gradient-text">Lab</span>
            </h1>
            <p className="text-muted-foreground mb-8">Compare two constellations side by side.</p>
          </motion.div>

          {/* Selectors */}
          <div className="flex items-center gap-4 mb-8">
            <Select value={leftId} onValueChange={setLeftId}>
              <SelectTrigger className="flex-1 bg-card/60 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {constellations.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ArrowLeftRight className="w-5 h-5 text-muted-foreground shrink-0" />
            <Select value={rightId} onValueChange={setRightId}>
              <SelectTrigger className="flex-1 bg-card/60 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {constellations.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visual comparison */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5 text-center">
              <div className="mx-auto w-fit rounded-xl bg-muted/20 p-3 mb-3">
                <ConstellationDiagram constellation={left} width={160} height={160} showLabels animated />
              </div>
              <h3 className="font-display text-xl font-bold">{left.name}</h3>
              <p className="text-xs text-muted-foreground">{left.alternateNames[0]}</p>
              {left.pronunciation && <p className="text-xs text-muted-foreground/60 italic mt-1">{left.pronunciation}</p>}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5 text-center">
              <div className="mx-auto w-fit rounded-xl bg-muted/20 p-3 mb-3">
                <ConstellationDiagram constellation={right} width={160} height={160} showLabels animated />
              </div>
              <h3 className="font-display text-xl font-bold">{right.name}</h3>
              <p className="text-xs text-muted-foreground">{right.alternateNames[0]}</p>
              {right.pronunciation && <p className="text-xs text-muted-foreground/60 italic mt-1">{right.pronunciation}</p>}
            </motion.div>
          </div>

          {/* Comparison table */}
          <div className="glass-card overflow-hidden">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3 ${i % 2 === 0 ? "bg-muted/5" : ""} ${i < rows.length - 1 ? "border-b border-border/20" : ""}`}
              >
                <div className="flex justify-end">{row.leftVal}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <row.icon className="w-4 h-4" />
                  <span className="text-xs font-medium whitespace-nowrap">{row.label}</span>
                </div>
                <div>{row.rightVal}</div>
              </div>
            ))}
          </div>

          {/* Mythology comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="glass-card p-5">
              <h4 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" /> {left.name} Mythology
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{left.mythology.slice(0, 200)}…</p>
            </div>
            <div className="glass-card p-5">
              <h4 className="font-display font-semibold text-sm flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" /> {right.name} Mythology
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{right.mythology.slice(0, 200)}…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
