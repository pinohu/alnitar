import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database, Globe, TrendingUp, AlertTriangle, BarChart3,
  Users, Telescope, Eye, Sparkles, Calendar, MapPin, ArrowRight
} from "lucide-react";
import {
  getSkyDataSummary, getTrendingObjects, getSkyAlerts,
  type SkySummary, type TrendingData, type SkyAlert
} from "@/lib/skyDataApi";
import { Link } from "react-router-dom";

export default function SkyDataPage() {
  const [summary, setSummary] = useState<SkySummary | null>(null);
  const [trending, setTrending] = useState<TrendingData | null>(null);
  const [alerts, setAlerts] = useState<SkyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSkyDataSummary(),
      getTrendingObjects(),
      getSkyAlerts(),
    ]).then(([s, t, a]) => {
      setSummary(s);
      setTrending(t);
      setAlerts(a.alerts);
    }).finally(() => setLoading(false));
  }, []);

  // Use only real API data; show zeros and empty state when no data
  const displaySummary: SkySummary = summary ?? {
    date: new Date().toISOString().split("T")[0],
    totalObservations: 0,
    uniqueObjects: 0,
    topObjects: [],
    regionCount: 0,
  };

  const displayTrending: TrendingData = trending ?? { period: "7d", trending: [] };
  const displayAlerts: SkyAlert[] = alerts;

  const severityColor = (s: string) => {
    switch (s) {
      case "highlight": return "bg-primary/10 text-primary border-primary/20";
      case "warning": return "bg-accent/10 text-accent border-accent/20";
      default: return "bg-secondary/10 text-secondary border-secondary/20";
    }
  };

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-7 h-7 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Sky <span className="gradient-text">Intelligence</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-8">
              Real-time aggregated observation data from the global Alnitar network.
            </p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Observations Today", value: displaySummary.totalObservations.toLocaleString(), icon: Eye, color: "text-primary" },
              { label: "Objects Detected", value: displaySummary.uniqueObjects.toString(), icon: Telescope, color: "text-secondary" },
              { label: "Active Regions", value: displaySummary.regionCount.toString(), icon: MapPin, color: "text-accent" },
              { label: "Active Alerts", value: displayAlerts.length.toString(), icon: AlertTriangle, color: "text-accent" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Sky Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Live Sky Alerts
            </h2>
            <div className="space-y-3">
              {displayAlerts.map(alert => (
                <div key={alert.id} className={`glass-card p-4 border ${severityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-sm">{alert.title}</h3>
                        <Badge variant="outline" className="text-[10px] capitalize border-border/30">
                          {alert.alert_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/70">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        {alert.region && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {alert.region}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {alert.observation_count.toLocaleString()} observers
                        </span>
                      </div>
                    </div>
                    <Sparkles className={`w-5 h-5 shrink-0 ${alert.severity === 'highlight' ? 'text-primary' : alert.severity === 'warning' ? 'text-accent' : 'text-secondary'}`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Trending Objects */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending This Week
              </h2>
              <div className="glass-card divide-y divide-border/20">
                {displayTrending.trending.map((obj, i) => (
                  <div key={obj.objectId} className="p-4 flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1">
                      <Link to={`/learn/${obj.objectId}`} className="font-display font-semibold text-sm hover:text-primary transition-colors">
                        {obj.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{obj.totalObservations.toLocaleString()} observations</span>
                        <span>·</span>
                        <span>{obj.avgConfidence}% avg confidence</span>
                      </div>
                    </div>
                    <div className="w-16 h-2 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${Math.min(100, (obj.totalObservations / (displayTrending.trending[0]?.totalObservations || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Objects Today */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-secondary" />
                Most Observed Today
              </h2>
              <div className="glass-card divide-y divide-border/20">
                {displaySummary.topObjects.map((obj, i) => (
                  <div key={obj.name} className="p-4 flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-display font-semibold text-sm">{obj.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{obj.observations.toLocaleString()} detections</span>
                        <span>·</span>
                        <span>{obj.avgConfidence}% confidence</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize border-border/30">{obj.type}</Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Data Platform CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 glass-card p-6 text-center border-primary/20"
          >
            <Database className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold mb-2">Astronomy Intelligence Platform</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
              Every observation contributes to the global sky intelligence network. Researchers, educators, and citizen scientists can access aggregated data through the Alnitar API.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="border-border/50" asChild>
                <Link to="/recognize">
                  <Telescope className="w-4 h-4 mr-2" />
                  Contribute an Observation
                </Link>
              </Button>
              <Button variant="outline" className="border-border/50" asChild>
                <Link to="/sky-network">
                  <Globe className="w-4 h-4 mr-2" />
                  View Live Network
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* API info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 glass-card p-6"
          >
            <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              API Endpoints
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {[
                { endpoint: "?endpoint=summary", desc: "Daily observation summary with top objects" },
                { endpoint: "?endpoint=trending", desc: "Most observed objects in the last 7 days" },
                { endpoint: "?endpoint=alerts", desc: "Active sky alerts and anomaly detections" },
                { endpoint: "?endpoint=regions", desc: "Observation density by geographic region" },
              ].map(api => (
                <div key={api.endpoint} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10">
                  <code className="text-primary shrink-0">GET</code>
                  <div>
                    <code className="text-foreground/80">/sky-data-api{api.endpoint}</code>
                    <p className="text-muted-foreground mt-1 font-sans text-xs">{api.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
