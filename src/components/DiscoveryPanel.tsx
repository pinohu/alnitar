import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Telescope, Binoculars, Eye, ArrowRight, Lightbulb, Zap, Trophy, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { constellations } from "@/data/constellations";
import type { Recommendation, SkyChallenge, CelestialEvent, DiscoveryResult } from "@/lib/discovery/types";

const categoryIcons: Record<string, React.ElementType> = {
  'best-tonight': Star,
  'beginner': Eye,
  'binocular': Binoculars,
  'deep-sky': Telescope,
  'challenge': Trophy,
  'up-next': ArrowRight,
  'setting-soon': Clock,
};

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  Moderate: 'bg-accent/20 text-accent border-accent/30',
  Challenging: 'bg-destructive/20 text-destructive border-destructive/30',
};

function RecCard({ rec, index = 0 }: { rec: Recommendation; index?: number }) {
  const constellation = constellations.find((c) => c.id === rec.objectId);
  const linkTo =
    rec.objectType === "constellation" && constellation
      ? `/learn/${constellation.slug}`
      : rec.objectType === "deep-sky"
        ? `/explore/object/dso/${rec.objectId.toLowerCase()}`
        : "/tonight";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={linkTo} className="glass-card-hover p-4 flex gap-3 items-start cursor-pointer">
        {constellation && (
          <div className="shrink-0 rounded bg-muted/20">
            <ConstellationDiagram constellation={constellation} width={52} height={52} />
          </div>
        )}
        {!constellation && (
          <div className="shrink-0 w-[52px] h-[52px] rounded bg-muted/20 flex items-center justify-center">
            <Telescope className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display font-semibold text-sm truncate">{rec.objectName}</h4>
            {rec.isNew && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">New</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">{rec.reason}</p>
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${difficultyColors[rec.difficulty]}`}>
              {rec.difficulty}
            </Badge>
            {rec.suggestedScope && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground border-border/50">
                {rec.suggestedScope === 'naked-eye' && <><Eye className="w-2.5 h-2.5 mr-0.5 inline" /> Naked eye</>}
                {rec.suggestedScope === 'binoculars' && <><Binoculars className="w-2.5 h-2.5 mr-0.5 inline" /> Binoculars</>}
                {rec.suggestedScope === 'small-scope' && <><Telescope className="w-2.5 h-2.5 mr-0.5 inline" /> Scope</>}
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/50 border-0">
              {rec.bestViewingTime}
            </Badge>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
      </Link>
    </motion.div>
  );
}

function RecSection({ title, icon: Icon, recs, emptyText }: {
  title: string; icon: React.ElementType; recs: Recommendation[]; emptyText?: string;
}) {
  if (recs.length === 0 && !emptyText) return null;
  return (
    <div className="mb-8">
      <h3 className="font-display font-semibold flex items-center gap-2 mb-3 text-sm">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h3>
      {recs.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recs.map((r, i) => <RecCard key={r.id} rec={r} index={i} />)}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: SkyChallenge }) {
  return (
    <Link
      to="/tonight"
      className="block glass-card p-5 border-primary/20 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors rounded-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold text-sm">Tonight's Challenge</h3>
        <Badge variant="outline" className={`text-[10px] ml-auto ${difficultyColors[challenge.difficulty]}`}>
          {challenge.difficulty}
        </Badge>
      </div>
      <p className="font-display font-bold text-lg mb-1">{challenge.title}</p>
      <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
      <p className="text-[10px] text-accent">{challenge.reward}</p>
    </Link>
  );
}

function EventCard({ event }: { event: CelestialEvent }) {
  const importanceStyles = {
    highlight: "border-accent/30 bg-accent/5",
    notable: "border-primary/20",
    minor: "border-border/30",
  };
  return (
    <Link
      to="/events"
      className={`block glass-card p-4 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors rounded-xl ${importanceStyles[event.importance]}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-accent" />
        <h4 className="font-display font-semibold text-sm">{event.title}</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{event.description.slice(0, 100)}</p>
      <p className="text-[10px] text-muted-foreground/70">{event.date}</p>
    </Link>
  );
}

// "What Matters Tonight" — curated top 3
export function WhatMattersTonight({ picks }: { picks: Recommendation[] }) {
  if (picks.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-accent" />
        What Matters Tonight
      </h2>
      <div className="space-y-2">
        {picks.map((rec, i) => (
          <RecCard key={rec.id} rec={rec} index={i} />
        ))}
      </div>
    </div>
  );
}

// Full discovery panel
export function DiscoveryPanel({ result }: { result: DiscoveryResult }) {
  return (
    <div>
      <WhatMattersTonight picks={result.topPicks} />

      {result.challenge && <ChallengeCard challenge={result.challenge} />}

      <div className="mt-8">
        <RecSection title="Best for Beginners" icon={Eye} recs={result.beginnerPicks} />
        <RecSection title="Best with Binoculars" icon={Binoculars} recs={result.binocularPicks} />
        <RecSection title="Deep Sky Targets" icon={Telescope} recs={result.deepSkyPicks} />
        <RecSection title="Challenge Targets" icon={Trophy} recs={result.challengePicks} />
        {result.upNext.length > 0 && (
          <RecSection title="Up Next — Your Learning Path" icon={ArrowRight} recs={result.upNext} />
        )}
        {result.settingSoon.length > 0 && (
          <RecSection title="Setting Soon" icon={Clock} recs={result.settingSoon} />
        )}
      </div>

      {result.events.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-3 text-sm">
            <Zap className="w-4 h-4 text-accent" /> Upcoming Events
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// Homepage compact version
export function HomepageDiscovery({ result }: { result: DiscoveryResult }) {
  const quickWin = result.beginnerPicks[0];
  const deepSky = result.deepSkyPicks[0];
  const picks = [result.tonightHighlight, quickWin, deepSky].filter(Boolean) as Recommendation[];
  const unique = picks.filter((p, i, arr) => arr.findIndex(x => x.objectId === p.objectId) === i).slice(0, 3);

  return (
    <div>
      <div className="flex items-center gap-2 text-accent text-sm font-medium mb-4">
        <Lightbulb className="w-4 h-4" />
        What Alnitar recommends for you tonight
      </div>
      <div className="space-y-2 mb-4">
        {unique.map((r, i) => <RecCard key={r.id} rec={r} index={i} />)}
      </div>
      {result.challenge && (
        <Link
          to="/tonight"
          className="block glass-card p-4 border-primary/20 mb-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="font-display font-semibold text-sm">{result.challenge.title}</span>
            <Badge variant="outline" className={`text-[10px] ml-auto ${difficultyColors[result.challenge.difficulty]}`}>
              {result.challenge.difficulty}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{result.challenge.description.slice(0, 80)}…</p>
        </Link>
      )}
      <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer">
        <Link to="/tonight">
          See full sky guide <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
