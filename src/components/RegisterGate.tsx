// src/components/RegisterGate.tsx — CTA to sign up / sign in to unlock a gated feature
import { Link } from "react-router-dom";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegisterGateProps {
  title: string;
  description: string;
  benefits?: string[];
  variant?: "card" | "inline" | "banner";
}

export function RegisterGate({ title, description, benefits = [], variant = "card" }: RegisterGateProps) {
  const content = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-primary">
        <Lock className="w-4 h-4 shrink-0" aria-hidden />
        <span className="font-display font-semibold text-sm">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {benefits.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button asChild size="sm" className="btn-glow">
          <Link to="/signup">Create free account</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="border-border/50">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );

  if (variant === "banner") {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-display font-semibold text-sm text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild size="sm" className="btn-glow">
            <Link to="/signup">Sign up free</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-border/50">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Lock className="w-4 h-4 text-primary shrink-0" aria-hidden />
        <span className="text-muted-foreground">{description}</span>
        <Link to="/signup" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
          Sign up free <ArrowRight className="w-3 h-3" />
        </Link>
        <span className="text-muted-foreground">or</span>
        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-primary/20">
      {content}
    </div>
  );
}
