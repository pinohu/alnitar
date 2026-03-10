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

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareTitle = `I found ${constellation.name} in the night sky! 🌌`;
  const shareText = `Just pointed my phone at the sky and Alnitar told me it was ${constellation.name}. Mind-blown.\n\n✨ ${constellation.funFact}\n\nTry it free — identify any constellation in seconds 👇`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared! Your friends can try Alnitar free.");
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `${shareTitle}\n\n${shareText}\n\n${shareUrl}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied! Paste anywhere to share. Your link brings friends to Alnitar.");
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
      <Button onClick={handleShare} variant="outline" size="sm" className="w-full border-primary/40 text-primary hover:bg-primary/10">
        <Share2 className="w-4 h-4 mr-2" />
        Share with friends — they can try free
      </Button>
    </div>
  );
}
