import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Users, MapPin, Bell, Telescope, Star, Eye, Activity, Radio, Loader2, Send } from "lucide-react";
import { isCloudflareConfigured, cfFetch } from "@/integrations/cloudflare/client";

interface FeedItem {
  id: string;
  constellation: string;
  location: string;
  date?: string;
  time: string;
  anonymous?: boolean;
}

interface NetworkStats {
  totalObserversTonight: number;
  totalObservationsTonight: number;
  constellationsSpotted: number;
  countries: number;
  meteorsDetected: number;
}

const SKY_ALERTS: Array<{ id: string; title: string; description: string; type: string; urgency: "high" | "medium" | "low"; time: string }> = [];

export default function SkyNetworkPage() {
  const [tab, setTab] = useState<"live" | "alerts" | "community">("live");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [stats, setStats] = useState<NetworkStats>({ totalObserversTonight: 0, totalObservationsTonight: 0, constellationsSpotted: 0, countries: 0, meteorsDetected: 0 });
  const [loading, setLoading] = useState(isCloudflareConfigured);
  const [error, setError] = useState<string | null>(null);
  const [meteorSubmitting, setMeteorSubmitting] = useState(false);
  const [meteorLat, setMeteorLat] = useState("");
  const [meteorLng, setMeteorLng] = useState("");
  const [meteorNotes, setMeteorNotes] = useState("");

  const loadFeed = useCallback(async () => {
    if (!isCloudflareConfigured) return;
    try {
      const res = await cfFetch("api/network/feed?limit=50");
      if (!res.ok) throw new Error("Failed to load feed");
      const data = (await res.json()) as { data?: FeedItem[] };
      setFeed(data.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
      setFeed([]);
    }
  }, []);

  const loadStats = useCallback(async () => {
    if (!isCloudflareConfigured) return;
    try {
      const res = await cfFetch("api/network/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      const data = (await res.json()) as NetworkStats;
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    }
  }, []);

  useEffect(() => {
    if (!isCloudflareConfigured) {
      setLoading(false);
      return;
    }
    setError(null);
    Promise.all([loadFeed(), loadStats()]).finally(() => setLoading(false));
  }, [loadFeed, loadStats]);

  const submitMeteor = async () => {
    const lat = Number.parseFloat(meteorLat);
    const lng = Number.parseFloat(meteorLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (!isCloudflareConfigured) return;
    setMeteorSubmitting(true);
    try {
      const res = await cfFetch("api/network/meteor", {
        method: "POST",
        body: JSON.stringify({ lat, lng, notes: meteorNotes.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Failed to report");
      setMeteorLat("");
      setMeteorLng("");
      setMeteorNotes("");
      loadStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to report meteor");
    } finally {
      setMeteorSubmitting(false);
    }
  };

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
          {loading && (
            <div className="glass-card p-6 mb-6 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading network data…</span>
            </div>
          )}
          {error && !loading && (
            <div className="glass-card p-4 mb-6 border-destructive/30 bg-destructive/5 text-destructive text-sm">
              {error}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 mb-6 flex flex-wrap gap-6 justify-center"
          >
            {[
              { label: "Active Observers", value: stats.totalObserversTonight.toLocaleString(), icon: Users },
              { label: "Observations Tonight", value: stats.totalObservationsTonight.toLocaleString(), icon: Eye },
              { label: "Countries", value: stats.countries.toString(), icon: Globe },
              { label: "Meteors Detected", value: stats.meteorsDetected.toString(), icon: Activity },
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
              {feed.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground text-sm">
                  No live observations yet. Set observation visibility to &quot;public&quot; or &quot;anonymous&quot; to appear in the feed.
                </div>
              ) : feed.map((obs, i) => (
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
                      {obs.anonymous && <Badge variant="secondary" className="text-[10px]">Anonymous</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {obs.location || "—"}
                    </div>
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

              {isCloudflareConfigured && (
                <div className="glass-card p-5 border-accent/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-accent" />
                    <h3 className="font-display font-semibold text-sm">Report meteor / transient</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Saw a meteor or other transient? Report it to the network.</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Input type="number" placeholder="Latitude" className="w-24 h-8 text-sm" value={meteorLat} onChange={e => setMeteorLat(e.target.value)} step="any" />
                    <Input type="number" placeholder="Longitude" className="w-24 h-8 text-sm" value={meteorLng} onChange={e => setMeteorLng(e.target.value)} step="any" />
                    <Input type="text" placeholder="Notes (optional)" className="flex-1 min-w-[120px] h-8 text-sm" value={meteorNotes} onChange={e => setMeteorNotes(e.target.value)} />
                    <Button size="sm" className="h-8" onClick={submitMeteor} disabled={meteorSubmitting}>
                      {meteorSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span className="ml-1.5">Report</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="glass-card p-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">Your contribution</p>
                <p className="font-display text-sm font-medium text-foreground">
                  When you save observations, they are included in the network. Set visibility to public or anonymous to appear in the live feed.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
