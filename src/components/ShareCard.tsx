import { useRef } from "react";
import { Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConstellationDiagram } from "./ConstellationDiagram";
import { type Constellation } from "@/data/constellations";
import { toast } from "sonner";

interface Props {
  constellation: Constellation;
  confidence: number;
  date?: string;
}

export function ShareCard({ constellation, confidence, date }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I found ${constellation.name}!`,
          text: `I identified ${constellation.name} with ${confidence}% confidence using Alnitar! ${constellation.funFact}`,
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
    const text = `🔭 I found ${constellation.name} (${constellation.alternateNames[0]}) with ${confidence}% confidence using Alnitar!\n\n✨ ${constellation.funFact}\n\n${window.location.origin}`;
    navigator.clipboard.writeText(text);
    toast.success("Discovery copied to clipboard!");
  };

  return (
    <div className="space-y-3">
      <div
        ref={cardRef}
        className="rounded-xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(222 47% 8%), hsl(230 45% 14%))" }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 text-primary text-xs font-medium mb-4">
            <Star className="w-3 h-3" />
            Alnitar Discovery
          </div>
          <div className="flex items-center gap-5">
            <div className="shrink-0 rounded-lg bg-background/20 p-2">
              <ConstellationDiagram constellation={constellation} width={100} height={100} showLabels />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">{constellation.name}</h3>
              <p className="text-sm text-muted-foreground">{constellation.alternateNames[0]}</p>
              <div className="mt-2 text-2xl font-display font-bold text-primary">{confidence}%</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/20">
            <p className="text-xs text-foreground/60 leading-relaxed">💡 {constellation.funFact.slice(0, 120)}…</p>
          </div>
          {date && (
            <p className="text-xs text-muted-foreground mt-2">{new Date(date).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      <Button onClick={handleShare} variant="outline" size="sm" className="w-full border-border/50">
        <Share2 className="w-4 h-4 mr-2" />
        Share Discovery
      </Button>
    </div>
  );
}
