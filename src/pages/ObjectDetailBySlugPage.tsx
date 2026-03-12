/**
 * Object detail by slug — single celestial object from seed with related objects.
 * Route: /objects/:slug (e.g. /objects/orion-nebula).
 */

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorite } from "@/hooks/use-favorites";
import { getObjectBySlugWithRelated } from "@/lib/seed";
import { DetailHero, FactGrid, TagRow, RelatedObjectGrid } from "@/components/explore/DetailBlocks";
import { usePageTitle } from "@/hooks/use-page-title";

export default function ObjectDetailBySlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getObjectBySlugWithRelated(slug) : null;

  const displayName = data ? (data.item.name_display ?? data.item.name) : "Object";
  usePageTitle(
    displayName,
    data ? data.item.summary : undefined,
    data ? { title: `${displayName} | Alnitar`, description: data.item.summary } : undefined
  );
  const { isSaved: saved, toggle: toggleSaved } = useFavorite("object", data?.item.slug ?? "");

  if (!data) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 px-4">
          <div className="container max-w-3xl text-center py-20">
            <h1 className="font-display text-2xl font-bold mb-4">Object not found</h1>
            <Button asChild variant="ghost">
              <Link to="/objects">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to objects
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
    "@type": "Thing",
    name: displayName,
    description: item.summary,
    additionalType: item.type,
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
            <Link to="/objects">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to objects
            </Link>
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <DetailHero
              eyebrow={item.type}
              title={displayName}
              subtitle={`${item.subtype} • Visible: ${item.visibility} • Hemisphere: ${item.hemisphere}`}
              body={item.summary}
            />

            <section className="mt-10 grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="font-display text-2xl font-semibold">About this object</h2>
                    <FavoriteButton
                      itemType="object"
                      itemId={item.slug}
                      isSaved={saved}
                      onToggle={() => toggleSaved()}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                  <p className="mt-4 leading-8 text-muted-foreground">
                    {displayName} is categorized as a {item.subtype}. Use this for discovery, education, and observation planning.
                  </p>
                </div>
                <FactGrid facts={item.facts} />
                <RelatedObjectGrid items={related} />
              </div>
              <aside className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-display text-xl font-semibold">Classification</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{item.type}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Subtype</dt>
                      <dd className="font-medium">{item.subtype}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Hemisphere</dt>
                      <dd className="font-medium capitalize">{item.hemisphere}</dd>
                    </div>
                  </dl>
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
