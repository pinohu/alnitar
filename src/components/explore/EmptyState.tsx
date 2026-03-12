/**
 * EmptyState — no-results message and CTA for explorer pages.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  body: string;
  href: string;
  cta: string;
}

export function EmptyState({ title, body, href, cta }: EmptyStateProps) {
  return (
    <div
      className="rounded-2xl border border-dashed border-border/50 bg-muted/20 p-10 text-center"
      role="status"
      aria-live="polite"
    >
      <SearchX className="mx-auto h-12 w-12 text-muted-foreground/70" aria-hidden />
      <h2 className="mt-4 font-display text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-8">{body}</p>
      <Button asChild variant="outline" size="sm" className="mt-6">
        <Link to={href}>{cta}</Link>
      </Button>
    </div>
  );
}
