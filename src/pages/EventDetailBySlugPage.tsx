/**
 * Event detail by slug — single astronomy event from seed with related events.
 * Route: /events/:slug (e.g. /events/perseids).
 */

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorite } from "@/hooks/use-favorites";
import { getEventBySlugWithRelated } from "@/lib/seed";
import { DetailHero, TagRow, RelatedEventGrid, StatPill } from "@/components/explore/DetailBlocks";
import { usePageTitle } from "@/hooks/use-page-title";

export default function EventDetailBySlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getEventBySlugWithRelated(slug) : null;

  const eventName = data?.item.name ?? "Event";
  usePageTitle(
    eventName,
    data ? data.item.summary : undefined,
    data ? { title: `${eventName} | Alnitar`, description: data.item.summary } : undefined
  );
  const { isSaved: saved, toggle: toggleSaved } = useFavorite("event", data?.item.slug ?? "");

  if (!data) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 px-4">
          <div className="container max-w-3xl text-center py-20">
            <h1 className="font-display text-2xl font-bold mb-4">Event not found</h1>
            <Button asChild variant="ghost">
              <Link to="/events/explore">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to events
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { item, related } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: item.name,
    description: item.summary,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    keywords: item.tags?.join(", ") ?? "",
  };

  return (
    <div className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-6xl">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-6">
            <Link to="/events/explore">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to events
            </Link>
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <DetailHero
              eyebrow={item.type}
              title={item.name}
              subtitle={`${item.recurrence} • Peak: ${item.peakWindow} • Best for: ${item.bestFor}`}
              body={item.summary}
            />

            <section className="mt-10 grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-semibold">Event overview</h2>
                    <FavoriteButton
                      itemType="event"
                      itemId={item.slug}
                      isSaved={saved}
                      onToggle={() => toggleSaved()}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="mt-4 leading-8 text-muted-foreground">
                    This event is part of Alnitar’s recurring sky calendar. Plan observing around the peak window; exact dates and visibility depend on your location and year.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <StatPill label="Type" value={item.type.replace("-", " ")} />
                  <StatPill label="Recurrence" value={item.recurrence} />
                  <StatPill label="Peak window" value={item.peakWindow} />
                </div>
                <RelatedEventGrid items={related} />
              </div>
              <aside className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-display text-xl font-semibold">Best visibility</h3>
                  <p className="mt-4 text-muted-foreground capitalize">{item.bestFor}</p>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display text-xl font-semibold">Tags</h3>
                  <div className="mt-4">
                    <TagRow tags={item.tags} />
                  </div>
                </div>
              </aside>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
