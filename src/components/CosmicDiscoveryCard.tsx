import { useRef } from "react";
import { Star, Share2, Sparkles, Telescope, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConstellationDiagram } from "./ConstellationDiagram";
import { type Constellation } from "@/data/constellations";
import { deepSkyCatalog } from "@/data/deepSkyObjects";
import { toast } from "sonner";

interface Props {
  constellation: Constellation;
  confidence: number;
  date?: string;
  format?: "square" | "vertical";
}

export function CosmicDiscoveryCard({ constellation, confidence, date, format = "square" }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dsos = deepSkyCatalog.filter(d => d.constellation === constellation.id).slice(0, 2);

  const isVertical = format === "vertical";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I discovered ${constellation.name} tonight! 🌌`,
          text: `I identified ${constellation.name} with ${confidence}% confidence using Alnitar!\n\n✨ ${constellation.funFact}\n\nDetected by Alnitar — Your Cosmic Camera`,
          url: window.location.origin,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `🌌 I discovered ${constellation.name} tonight!\n\n🔭 Detected with ${confidence}% confidence by Alnitar\n⭐ ${constellation.stars.sort((a, b) => a.magnitude - b.magnitude).slice(0, 3).map(s => s.name).join(', ')}\n${dsos.length > 0 ? `🌠 Contains: ${dsos.map(d => d.name).join(', ')}\n` : ''}\n💡 ${constellation.funFact}\n\n${window.location.origin}`;
    navigator.clipboard.writeText(text);
    toast.success("Discovery copied to clipboard!");
  };

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className={`rounded-2xl overflow-hidden ${isVertical ? 'max-w-[320px]' : 'max-w-[400px]'}`}
        style={{ background: "linear-gradient(145deg, hsl(222 47% 6%), hsl(250 40% 12%), hsl(222 47% 8%))" }}
      >
        <div className={`p-6 ${isVertical ? 'pb-4' : ''}`}>
          {/* Header */}
          <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Cosmic Discovery
          </div>

          {/* Constellation Diagram */}
          <div className={`flex ${isVertical ? 'flex-col items-center' : 'items-center gap-5'}`}>
            <div className={`shrink-0 rounded-xl p-3 ${isVertical ? 'mb-4' : ''}`}
              style={{ background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.1)" }}>
              <ConstellationDiagram
                constellation={constellation}
                width={isVertical ? 140 : 110}
                height={isVertical ? 140 : 110}
                showLabels
              />
            </div>
            <div className={isVertical ? 'text-center' : ''}>
              <h3 className="font-display text-2xl font-bold text-foreground">{constellation.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{constellation.alternateNames[0]}</p>
              <div className="flex items-center gap-2 mt-3 justify-center">
                <div className="text-3xl font-display font-bold text-primary">{confidence}%</div>
                <span className="text-[10px] text-muted-foreground uppercase">match</span>
              </div>
            </div>
          </div>

          {/* Stars */}
          <div className="mt-4 pt-4 border-t border-border/10">
            <div className="flex items-center gap-1.5 text-[10px] text-accent font-medium mb-2">
              <Star className="w-3 h-3" /> Key Stars
            </div>
            <div className="flex flex-wrap gap-1.5">
              {constellation.stars.sort((a, b) => a.magnitude - b.magnitude).slice(0, 4).map(s => (
                <Badge key={s.name} variant="outline" className="text-[10px] border-border/20 bg-background/10">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* DSOs */}
          {dsos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/10">
              <div className="flex items-center gap-1.5 text-[10px] text-secondary font-medium mb-2">
                <Telescope className="w-3 h-3" /> Hidden Objects
              </div>
              {dsos.map(d => (
                <p key={d.id} className="text-[11px] text-foreground/60">
                  {d.catalog} — {d.name} <span className="text-muted-foreground">({d.distance})</span>
                </p>
              ))}
            </div>
          )}

          {/* Fun Fact */}
          <div className="mt-3 pt-3 border-t border-border/10">
            <p className="text-[11px] text-foreground/50 leading-relaxed">
              💡 {constellation.funFact.slice(0, 120)}…
            </p>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="font-semibold text-foreground/70">Alnitar</span>
            </div>
            {date && <span className="text-[10px] text-muted-foreground">{new Date(date).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 border-border/50">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={copyToClipboard}>
          <Download className="w-4 h-4 mr-2" />
          Copy
        </Button>
      </div>

      {/* Format toggle */}
      <div className="flex gap-2 justify-center">
        <Badge
          variant={format === "square" ? "default" : "outline"}
          className="cursor-pointer text-[10px]"
        >
          1:1
        </Badge>
        <Badge
          variant={format === "vertical" ? "default" : "outline"}
          className="cursor-pointer text-[10px]"
        >
          9:16
        </Badge>
      </div>
    </div>
  );
}
