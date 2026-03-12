/**
 * Seed object detail — single celestial object from the unified catalog (summary, facts, tags).
 * Links to existing DSO or constellation pages where applicable.
 */

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSeedObjectById } from "@/lib/seed";
import { getDeepSkyObjectById } from "@/data/deepSkyObjects";
import { usePageTitle } from "@/hooks/use-page-title";

/** Derive DSO route id from seed object facts.catalog (e.g. M42 → m42, NGC 7293 → ngc7293). */
function getDsoIdFromCatalog(catalog: string | undefined): string | undefined {
  if (!catalog) return undefined;
  const c = catalog.replace(/\s/g, "");
  if (/^M\d+$/i.test(c)) return c.toLowerCase();
  if (/^NGC\s*\d+$/i.test(c)) return "ngc" + c.replace(/\D/g, "");
  return undefined;
}

export default function SeedObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const object = id ? getSeedObjectById(id) : undefined;

  usePageTitle(
    object ? (object.name_display ?? object.name) : "Object",
    object ? object.summary : undefined
  );

  if (!object) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 px-4">
          <div className="container max-w-3xl text-center py-20">
            <h1 className="font-display text-2xl font-bold mb-4">Object not found</h1>
            <Button asChild variant="ghost">
              <Link to="/explore/catalog">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const dsoId = getDsoIdFromCatalog(object.facts?.catalog);
  const hasDsoDetail = dsoId ? !!getDeepSkyObjectById(dsoId) : false;
  const constellationSlug = object.type === "constellation" ? object.slug : undefined;

  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground mb-6">
            <Link to="/explore/catalog">
              <ArrowLeft className="w-4 h-4 mr-1" /> Catalog
            </Link>
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card p-6 sm:p-8 mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <h1 className="font-display text-3xl sm:text-4xl font-bold">{object.name_display ?? object.name}</h1>
                <Badge variant="secondary" className="capitalize bg-muted/50 border-0">
                  {object.type.replace("-", " ")}
                </Badge>
                <Badge variant="secondary" className="bg-muted/50 border-0">
                  {object.subtype}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed">{object.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {object.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            {Object.keys(object.facts).length > 0 && (
              <div className="glass-card p-6 mb-6">
                <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" aria-hidden /> Facts
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries(object.facts).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {constellationSlug && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/learn/${constellationSlug}`}>View constellation</Link>
                </Button>
              )}
              {hasDsoDetail && dsoId && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/explore/object/dso/${dsoId}`}>Deep-sky detail</Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
