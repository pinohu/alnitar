/**
 * Event detail page — single astronomy event (meteor shower, eclipse, opposition, etc.).
 * Uses real event data from eventAwareness (EVENTS_2026); no placeholders.
 */

import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Star, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorite } from "@/hooks/use-favorites";
import { getEventById } from "@/lib/discovery/eventAwareness";
import type { CelestialEvent } from "@/lib/discovery/types";
import { trackEvent } from "@/lib/analytics";
import { usePageTitle } from "@/hooks/use-page-title";

function EventTypeIcon({ type }: { type: CelestialEvent["type"] }) {
  if (type === "meteor-shower") return <Sparkles className="w-5 h-5 text-primary" />;
  return <Star className="w-5 h-5 text-primary" />;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const event = id ? getEventById(id) : undefined;
  const { isSaved: saved, toggle: toggleSaved } = useFavorite("event", event?.id ?? "");

  usePageTitle(
    event ? event.title : "Event",
    event ? `${event.type.replace("-", " ")} · ${event.date}${event.endDate ? ` – ${event.endDate}` : ""}. ${event.description.slice(0, 120)}…` : undefined
  );

  useEffect(() => {
    if (event) trackEvent("event_viewed", { event_id: event.id, event_type: event.type, source: "detail_page" });
  }, [event]);

  if (!event) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 px-4">
          <div className="container max-w-3xl text-center py-20">
            <h1 className="font-display text-2xl font-bold mb-4">Event not found</h1>
            <Button asChild variant="ghost">
              <Link to="/events">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
              </Link>
            </Button>
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
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-6">
            <Link to="/events">
              <ArrowLeft className="w-4 h-4 mr-1" /> Events
            </Link>
          </Button>
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 sm:p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <EventTypeIcon type={event.type} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold">{event.title}</h1>
                  <FavoriteButton
                    itemType="event"
                    itemId={event.id}
                    isSaved={saved}
                    onToggle={() => toggleSaved()}
                    className="ml-auto"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize bg-muted/50 border-0">
                    {event.type.replace("-", " ")}
                  </Badge>
                  {event.importance === "highlight" && (
                    <Badge variant="outline" className="border-accent/40 text-accent">
                      Highlight
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="w-4 h-4 shrink-0" aria-hidden />
              <span>
                {event.date}
                {event.endDate ? ` – ${event.endDate}` : ""}
              </span>
            </div>
            <p className="text-foreground/90 leading-relaxed mb-6">{event.description}</p>
            {event.relatedObjects.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Related constellations</p>
                <div className="flex flex-wrap gap-2">
                  {event.relatedObjects.map((objId) => (
                    <Link
                      key={objId}
                      to={`/learn/${objId}`}
                      className="text-sm text-primary hover:underline capitalize"
                    >
                      {objId.replace("-", " ")}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.article>
        </div>
      </div>
    </div>
  );
}
