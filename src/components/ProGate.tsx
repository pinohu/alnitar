// src/components/ProGate.tsx — Upgrade to Pro CTA when a Pro-only feature is accessed
import { Link } from "react-router-dom";
import { Award, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProGateProps {
  title?: string;
  description?: string;
  variant?: "card" | "inline";
}

const defaultTitle = "Alnitar Pro";
const defaultDescription = "Session planner, observing programs, year in review, and exportable logs are part of Pro. Upgrade when you're ready to plan every session and share your log with your club or program.";

export function ProGate({ title = defaultTitle, description = defaultDescription, variant = "card" }: ProGateProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button asChild size="sm" className="btn-glow shrink-0">
          <Link to="/pricing">Upgrade to Pro</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 text-center border-primary/20">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Award className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      <Button asChild className="btn-glow">
        <Link to="/pricing">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}
