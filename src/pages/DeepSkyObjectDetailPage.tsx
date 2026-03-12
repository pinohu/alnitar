/**
 * Deep-sky object detail page — scientific metadata, visibility, observation tips.
 * PRD: object detail pages, descriptions, scientific metadata, visibility guidance, related objects.
 */

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, Eye, Camera, BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorite } from "@/hooks/use-favorites";
import { getDeepSkyObjectById } from "@/data/deepSkyObjects";
import { getConstellationById } from "@/data/constellations";
import { trackEvent } from "@/lib/analytics";
import { usePageTitle } from "@/hooks/use-page-title";

export default function DeepSkyObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const object = id ? getDeepSkyObjectById(id) : undefined;
  const { isSaved: saved, toggle: toggleSaved } = useFavorite("dso", object?.id ?? "");

  usePageTitle(
    object ? `${object.name} (${object.id})` : "Deep-Sky Object",
    object ? `${object.type} in ${object.constellation}. Magnitude ${object.magnitude ?? "—"}, best months: ${object.bestMonths?.join(", ") ?? "—"}.` : undefined
  );

  useEffect(() => {
    if (object) trackEvent("object_viewed", { object_id: object.id, object_type: "dso", source: "detail_page" });
  }, [object]);

  if (!object) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 px-4">
          <div className="container max-w-3xl text-center py-20">
            <h1 className="font-display text-2xl font-bold mb-4">Object not found</h1>
            <Button asChild variant="ghost">
              <Link to="/explore/objects">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Explorer
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const constellation = getConstellationById(object.constellation);

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-6">
            <Link to="/explore/objects">
              <ArrowLeft className="w-4 h-4 mr-1" /> Explorer
            </Link>
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-6 sm:p-8 mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <h1 className="font-display text-3xl sm:text-4xl font-bold">{object.name}</h1>
                <Badge variant="secondary" className="bg-muted/50 border-0">
                  {object.catalog}
                </Badge>
                <Badge variant="secondary" className="bg-muted/50 border-0 capitalize">
                  {object.type.replace("-", " ")}
                </Badge>
                <FavoriteButton
                  itemType="dso"
                  itemId={object.id}
                  isSaved={saved}
                  onToggle={() => toggleSaved()}
                  className="ml-auto"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed">{object.description}</p>
            </div>

            <div className="glass-card p-6 mb-6">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" aria-hidden /> Scientific data
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Position</dt>
                  <dd className="font-medium">RA {object.rightAscension}, Dec {object.declination}</dd>
                </div>
                {object.size && (
                  <div>
                    <dt className="text-muted-foreground">Angular size</dt>
                    <dd className="font-medium">{object.size}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Magnitude</dt>
                  <dd className="font-medium">{object.magnitude}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Distance</dt>
                  <dd className="font-medium">{object.distance}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Visibility</dt>
                  <dd className="font-medium capitalize">{object.visibility}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Calendar className="w-4 h-4" aria-hidden /> Best months
                  </dt>
                  <dd className="font-medium">{object.bestMonths.join(", ")}</dd>
                </div>
              </dl>
            </div>

            {constellation && (
              <div className="glass-card p-6 mb-6">
                <h2 className="font-display font-semibold flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" aria-hidden /> Related constellation
                </h2>
                <Button asChild variant="outline" size="sm" className="border-border/50">
                  <Link to={`/learn/${constellation.slug}`}>{constellation.name}</Link>
                </Button>
              </div>
            )}

            <div className="glass-card p-6 mb-6">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-primary" aria-hidden /> Observation tips
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Best seen with <strong className="capitalize">{object.visibility}</strong> from dark skies during{" "}
                {object.bestMonths.slice(0, 3).join(", ")}. Locate the constellation above, then use a star chart or app to star-hop to this object.
              </p>
            </div>

            {object.photographyTips && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold flex items-center gap-2 mb-3">
                  <Camera className="w-5 h-5 text-primary" aria-hidden /> Astrophotography
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed">{object.photographyTips}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
