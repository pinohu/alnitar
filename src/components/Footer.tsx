// src/components/Footer.tsx
import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/learn", label: "Learn" },
  { to: "/sky", label: "Sky Map" },
  { to: "/journal", label: "Journal" },
  { to: "/pricing", label: "Pricing" },
  { to: "/partners", label: "For organizations" },
  { to: "/support", label: "Support" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 border-t border-border/30 bg-background/40 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Block 1: Copyright & contact (proximity — related info grouped) */}
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <p className="text-sm sm:text-sm text-muted-foreground">
              © {year} Alnitar. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/90 max-w-md">
              Developed by ToriMedia, Obuke LLC Series 10 · 924 W 23rd St., Erie, PA 16502
            </p>
            <a
              href="mailto:support@alnitar.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md min-h-[44px] inline-flex items-center justify-center sm:justify-start py-2 -my-1"
            >
              support@alnitar.com
            </a>
          </div>

          {/* Block 2: Nav links (Fitts's Law — adequate touch targets) */}
          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2" aria-label="Footer navigation">
            {footerLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background py-2 px-1"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
