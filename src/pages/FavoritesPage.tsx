// src/pages/FavoritesPage.tsx — Saved objects and events list (favorites).

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Star, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { useFavoritesList } from "@/hooks/use-favorites";
import { getDeepSkyObjectById } from "@/data/deepSkyObjects";
import { getConstellationById } from "@/data/constellations";
import { getEventById } from "@/lib/discovery/eventAwareness";
import { getObjectBySlug } from "@/lib/seed";
import { getSeedEventBySlug } from "@/lib/seed";
import { ObjectCard } from "@/components/explore/ObjectCard";
import { EventCard } from "@/components/explore/EventCard";
import { usePageTitle } from "@/hooks/use-page-title";
import type { SavedItem } from "@/types/domain";

export default function FavoritesPage() {
  usePageTitle("Favorites", "Your saved celestial objects and events.");
  const items = useFavoritesList();

  const dsoItems = items.filter((x) => x.itemType === "dso");
  const eventItems = items.filter((x) => x.itemType === "event");
  const constellationItems = items.filter((x) => x.itemType === "constellation");

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-6">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Link>
          </Button>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary fill-primary" aria-hidden />
              Favorites
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Objects and events you saved. Saved on this device; sign in to sync across devices (Pro).
            </p>

            {items.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground mb-4">No favorites yet.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Save deep-sky objects from the Explorer and events from the Events page.
                </p>
                <Button asChild variant="outline">
                  <Link to="/objects">Browse objects</Link>
                </Button>
                <span className="mx-2 text-muted-foreground">or</span>
                <Button asChild variant="outline">
                  <Link to="/events/explore">Browse events</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {objectItems.length > 0 && (
                  <section>
                    <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" /> Celestial objects
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {objectItems.map((item) => (
                        <SavedObjectCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}
                {dsoItems.length > 0 && (
                  <section>
                    <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" /> Deep-sky objects
                    </h2>
                    <ul className="space-y-2">
                      {dsoItems.map((item) => (
                        <SavedDsoCard key={item.id} item={item} />
                      ))}
                    </ul>
                  </section>
                )}
                {eventItems.length > 0 && (
                  <section>
                    <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" /> Events
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {eventItems.map((item) => (
                        <SavedEventCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}
                {constellationItems.length > 0 && (
                  <section>
                    <h2 className="font-display font-semibold text-lg mb-3">Constellations</h2>
                    <ul className="space-y-2">
                      {constellationItems.map((item) => (
                        <SavedConstellationCard key={item.id} item={item} />
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SavedDsoCard({ item }: { item: SavedItem }) {
  const dso = item.itemType === "dso" ? getDeepSkyObjectById(item.itemId) : null;
  if (!dso) return null;
  return (
    <li>
      <Link
        to={`/explore/object/dso/${dso.id}`}
        className="glass-card block p-4 hover:border-primary/30 transition-colors"
      >
        <span className="font-medium">{dso.name}</span>
        <span className="text-muted-foreground text-sm ml-2">
          {dso.catalog} · {dso.type}
        </span>
      </Link>
    </li>
  );
}

function SavedObjectCard({ item }: { item: SavedItem }) {
  if (item.itemType !== "object") return null;
  const obj = getObjectBySlug(item.itemId);
  if (!obj) return null;
  return (
    <div className="list-none">
      <ObjectCard item={obj} />
    </div>
  );
}

function SavedEventCard({ item }: { item: SavedItem }) {
  if (item.itemType !== "event") return null;
  const seedEvent = getSeedEventBySlug(item.itemId);
  if (seedEvent) {
    return (
      <div className="list-none">
        <EventCard item={seedEvent} />
      </div>
    );
  }
  const dateEvent = getEventById(item.itemId);
  if (!dateEvent) return null;
  return (
    <div className="list-none">
      <Link
        to={`/events/${dateEvent.id}`}
        className="glass-card block p-4 hover:border-primary/30 transition-colors"
      >
        <span className="font-medium">{dateEvent.title}</span>
        <span className="text-muted-foreground text-sm ml-2 capitalize">
          {dateEvent.type.replace("-", " ")} · {dateEvent.date}
        </span>
      </Link>
    </div>
  );
}

function SavedConstellationCard({ item }: { item: SavedItem }) {
  const constellation = item.itemType === "constellation" ? getConstellationById(item.itemId) : null;
  if (!constellation) return null;
  return (
    <li>
      <Link
        to={`/learn/${constellation.slug}`}
        className="glass-card block p-4 hover:border-primary/30 transition-colors"
      >
        <span className="font-medium">{constellation.name}</span>
      </Link>
    </li>
  );
}
