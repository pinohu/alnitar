import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Star, Sparkles } from "lucide-react";
import { isCloudflareConfigured, cfFetch } from "@/integrations/cloudflare/client";
import type { CelestialEvent } from "@/lib/discovery/types";
import { getUpcomingEvents } from "@/lib/discovery/eventAwareness";

export default function EventsPage() {
  const [events, setEvents] = useState<CelestialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(90);

  const load = useCallback(async () => {
    setLoading(true);
    if (isCloudflareConfigured) {
      try {
        const res = await cfFetch(`api/events/upcoming?days=${days}`);
        if (res.ok) {
          const data = (await res.json()) as { data?: CelestialEvent[] };
          setEvents(data.data ?? []);
          setLoading(false);
          return;
        }
      } catch {
        // fallback to static
      }
    }
    setEvents(getUpcomingEvents(new Date(), days));
    setLoading(false);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const importanceClass = (e: CelestialEvent) =>
    e.importance === "highlight" ? "border-accent/40 bg-accent/5" : "border-border/40";

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl sm:text-4xl font-bold">
                Upcoming <span className="gradient-text">Events</span>
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">
              Meteor showers, oppositions, eclipses, and seasonal highlights. Plan your observing nights.
            </p>
            <Link to="/events/simulate" className="text-sm text-primary hover:underline">
              Simulate an event (e.g. lunar eclipse) →
            </Link>
          </motion.div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Next</span>
            <select
              className="bg-card border border-border rounded-md px-2 py-1.5 text-sm"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
            <span className="text-sm text-muted-foreground">days</span>
          </div>

          {loading ? (
            <div className="glass-card p-12 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading events…</span>
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground text-sm">
              No upcoming events in this window. Check back later or expand the range.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card p-5 ${importanceClass(e)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {e.type === "meteor-shower" ? (
                        <Sparkles className="w-5 h-5 text-primary" />
                      ) : (
                        <Star className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-sm">{e.title}</h3>
                        <Badge variant="secondary" className="text-[10px] capitalize bg-muted/50 border-0">
                          {e.type.replace("-", " ")}
                        </Badge>
                        {e.importance === "highlight" && (
                          <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">
                            Highlight
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{e.description}</p>
                      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                        <span>{e.date}</span>
                        {e.endDate && <span>– {e.endDate}</span>}
                        {e.relatedObjects?.length ? (
                          <span>Related: {e.relatedObjects.slice(0, 3).join(", ")}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
