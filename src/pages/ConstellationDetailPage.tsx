import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, BookOpen, Telescope, Star, Lightbulb, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StarField } from "@/components/StarField";
import { getConstellationBySlug } from "@/data/constellations";
import { ConstellationDiagram } from "@/components/ConstellationDiagram";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

export default function ConstellationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const constellation = getConstellationBySlug(slug || "");

  useEffect(() => {
    if (constellation) trackEvent("constellation_viewed", { name: constellation.name });
  }, [constellation]);

  if (!constellation) {
    return (
      <div className="relative min-h-screen">
        <StarField />
        <Navbar />
        <div className="relative z-10 pt-24 px-4">
          <div className="container max-w-3xl text-center py-20">
            <h1 className="font-display text-2xl font-bold mb-4">Constellation not found</h1>
            <Button asChild variant="ghost"><Link to="/learn"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Library</Link></Button>
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
            <Link to="/learn"><ArrowLeft className="w-4 h-4 mr-1" /> Library</Link>
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="glass-card p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="shrink-0 rounded-xl bg-muted/20 p-3">
                  <ConstellationDiagram constellation={constellation} width={200} height={200} showLabels animated />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">{constellation.name}</h1>
                  <p className="text-muted-foreground mb-3">{constellation.alternateNames.join(" · ")} ({constellation.abbreviation})</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                    <Badge variant="secondary" className="bg-muted/50 border-0">{constellation.bestSeason}</Badge>
                    <Badge variant="secondary" className="bg-muted/50 border-0 capitalize">{constellation.hemisphere}</Badge>
                    <Badge variant="secondary" className="bg-muted/50 border-0">{constellation.area} sq°</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>{constellation.bestMonths.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>RA {constellation.rightAscension}, Dec {constellation.declination}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mythology */}
            <div className="glass-card p-6 mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-primary" /> Mythology & History
              </h2>
              <p className="text-foreground/80 leading-relaxed">{constellation.mythology}</p>
            </div>

            {/* Spotting Tips */}
            <div className="glass-card p-6 mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-accent" /> Spotting Tips
              </h2>
              <p className="text-foreground/80 leading-relaxed">{constellation.spottingTips}</p>
            </div>

            {/* Fun Fact */}
            <div className="glass-card p-6 mb-4 border-primary/20">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" /> Fun Fact
              </h2>
              <p className="text-foreground/80 leading-relaxed">{constellation.funFact}</p>
            </div>

            {/* Stars table */}
            <div className="glass-card p-6 mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-accent" /> Stars
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 text-muted-foreground">
                      <th className="text-left pb-2 font-medium">Name</th>
                      <th className="text-left pb-2 font-medium">Magnitude</th>
                      <th className="text-left pb-2 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constellation.stars.sort((a,b) => a.magnitude - b.magnitude).map(star => (
                      <tr key={star.name} className="border-b border-border/10">
                        <td className="py-2 font-medium">{star.name}</td>
                        <td className="py-2 text-muted-foreground">{star.magnitude.toFixed(2)}</td>
                        <td className="py-2 text-muted-foreground">{star.spectralType || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deep sky objects */}
            {constellation.deepSkyObjects.length > 0 && (
              <div className="glass-card p-6 mb-4">
                <h2 className="font-display font-semibold flex items-center gap-2 mb-4">
                  <Telescope className="w-5 h-5 text-secondary" /> Deep Sky Objects
                </h2>
                <div className="space-y-4">
                  {constellation.deepSkyObjects.map(obj => (
                    <div key={obj.name} className="p-4 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{obj.name}</span>
                        <Badge variant="outline" className="text-xs border-border/50 capitalize">{obj.type}</Badge>
                        {obj.magnitude && <span className="text-xs text-muted-foreground">{obj.magnitude}m</span>}
                      </div>
                      <p className="text-sm text-foreground/70">{obj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
