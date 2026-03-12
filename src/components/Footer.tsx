// src/components/Footer.tsx — Grouped by category (proximity, recognition)
import { Link } from "react-router-dom";

const productLinks = [
  { to: "/learn", label: "Learn" },
  { to: "/sky", label: "Sky Map" },
  { to: "/journal", label: "Journal" },
  { to: "/pricing", label: "Pricing" },
] as const;

const exploreLinks = [
  { to: "/objects", label: "Celestial objects" },
  { to: "/events/explore", label: "Astronomy events" },
  { to: "/events", label: "Upcoming events" },
  { to: "/objects?tag=beginner", label: "Beginner picks" },
] as const;

const companyLinks = [
  { to: "/partners", label: "Clubs & organizations" },
  { to: "/support", label: "Support" },
] as const;

const legalLinks = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

function LinkGroup({ title, links, ariaLabel }: { title: string; links: readonly { to: string; label: string }[]; ariaLabel: string }) {
  return (
    <nav className="flex flex-col gap-2" aria-label={ariaLabel}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center py-2 -my-1 rounded-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 border-t border-border/30 bg-background/40 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container px-4 sm:px-6 py-8 min-w-0 overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 min-w-0">
          {/* Brand & contact */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-display font-bold">
              Alni<span className="text-primary">tar</span>
            </p>
            <p className="text-sm text-muted-foreground">© {year} Alnitar. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/90 max-w-xs break-words">
              Developed by ToriMedia, Obuke LLC Series 10 · Erie, PA
            </p>
            <a
              href="mailto:support@alnitar.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] inline-flex items-center py-2 -my-1 rounded-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              support@alnitar.com
            </a>
          </div>
          <LinkGroup title="Product" links={productLinks} ariaLabel="Product links" />
          <LinkGroup title="Explore" links={exploreLinks} ariaLabel="Explore links" />
          <LinkGroup title="Company" links={companyLinks} ariaLabel="Company links" />
          <LinkGroup title="Legal" links={legalLinks} ariaLabel="Legal links" />
        </div>
      </div>
    </footer>
  );
}
