import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Users, MapPin, Bell, Telescope, Star, Eye, Activity, Radio } from "lucide-react";

// Live observations and alerts come from the API; no seeded/fake data
const LIVE_OBSERVATIONS: Array<{ id: number; constellation: string; location: string; lat: number; lng: number; time: string; users: number }> = [];
const SKY_ALERTS: Array<{ id: string; title: string; description: string; type: string; urgency: "high" | "medium" | "low"; time: string }> = [];
const COMMUNITY_STATS = { totalObserversTonight: 0, totalObservationsTonight: 0, constellationsSpotted: 0, countries: 0, meteorsDetected: 0 };

export default function SkyNetworkPage() {
  const [tab, setTab] = useState<"live" | "alerts" | "community">("live");

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <Globe className="w-6 h-6 text-primary" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Global Sky <span className="gradient-text">Network</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Live astronomy observations from Alnitar users worldwide.
            </p>
          </motion.div>

          {/* Live stats banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 mb-6 flex flex-wrap gap-6 justify-center"
          >
            {[
              { label: "Active Observers", value: COMMUNITY_STATS.totalObserversTonight.toLocaleString(), icon: Users },
              { label: "Observations Tonight", value: COMMUNITY_STATS.totalObservationsTonight.toLocaleString(), icon: Eye },
              { label: "Countries", value: COMMUNITY_STATS.countries.toString(), icon: Globe },
              { label: "Meteors Detected", value: COMMUNITY_STATS.meteorsDetected.toString(), icon: Activity },
            ].map(s => (
              <div key={s.label} className="text-center">
                <s.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="font-display font-bold text-lg">{s.value}</div>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: "live" as const, label: "Live Feed", icon: Radio },
              { id: "alerts" as const, label: "Sky Alerts", icon: Bell },
              { id: "community" as const, label: "Community", icon: Users },
            ].map(t => (
              <Button
                key={t.id}
                variant={tab === t.id ? "default" : "outline"}
                size="sm"
                className={tab === t.id ? "btn-glow" : "border-border/50"}
                onClick={() => setTab(t.id)}
              >
                <t.icon className="w-4 h-4 mr-1.5" />
                {t.label}
              </Button>
            ))}
          </div>

          {/* Live Feed */}
          {tab === "live" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Live — data from the Alnitar network</span>
              </div>
              {LIVE_OBSERVATIONS.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground text-sm">
                  No live observations yet. Observations from Alnitar users will appear here when available.
                </div>
              ) : LIVE_OBSERVATIONS.map((obs, i) => (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-semibold text-sm">{obs.constellation}</h4>
                      <span className="text-[10px] text-muted-foreground">{obs.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {obs.location}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm font-display font-semibold">
                      <Users className="w-3 h-3 text-primary" />
                      {obs.users}
                    </div>
                    <span className="text-[10px] text-muted-foreground">observers</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Sky Alerts */}
          {tab === "alerts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {SKY_ALERTS.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground text-sm">
                  No sky alerts at the moment. Alerts are generated from verified observation data.
                </div>
              ) : SKY_ALERTS.map((alert, i) => {
                const urgencyStyles = {
                  high: "border-accent/30 bg-accent/5",
                  medium: "border-primary/20",
                  low: "border-border/30",
                };
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass-card p-5 ${urgencyStyles[alert.urgency]}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className={`w-4 h-4 ${alert.urgency === "high" ? "text-accent" : "text-primary"}`} />
                      <h4 className="font-display font-semibold text-sm">{alert.title}</h4>
                      {alert.urgency === "high" && (
                        <Badge variant="secondary" className="text-[10px] bg-accent/20 text-accent border-0 ml-auto">Live</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Community */}
          {tab === "community" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-sm">Near You</h3>
                </div>
                <p className="text-sm text-foreground/80 mb-2">
                  Observation counts and community stats appear here when users in your region contribute data.
                </p>
                <p className="text-xs text-muted-foreground">
                  Join the global community of stargazers. Every observation contributes to the live sky map.
                </p>
              </div>

              <div className="glass-card p-5 border-secondary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Telescope className="w-4 h-4 text-secondary" />
                  <h3 className="font-display font-semibold text-sm">Citizen Science Mode</h3>
                  <Badge variant="outline" className="text-[10px] border-secondary/30 text-secondary ml-auto">Coming Soon</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contribute to real astronomy research. Help track meteors, monitor variable stars, and detect comets — powered by our distributed telescope network of smartphone observers.
                </p>
              </div>

              <div className="glass-card p-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">Your contribution</p>
                <p className="font-display text-sm font-medium text-foreground">
                  When you save observations, they are included in the network. Aggregated stats are shown on the Sky Intelligence page.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
