// src/components/Navbar.tsx — Usability: primary actions visible, rest in "More" (progressive disclosure, chunking)
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Camera,
  Moon,
  BookOpen,
  NotebookPen,
  Globe,
  Smartphone,
  Radio,
  Clock,
  Compass,
  ArrowLeftRight,
  Upload,
  Database,
  Calendar,
  Target,
  User,
  Eye,
  Heart,
} from "lucide-react";
import { useNightVision } from "@/contexts/NightVisionContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import alnitarLogo from "@/assets/alnitar-logo.png";

type NavItem = { path: string; label: string; icon: React.ElementType };

const primaryItems: NavItem[] = [
  { path: "/recognize", label: "Cosmic Camera", icon: Camera },
  { path: "/tonight", label: "Tonight", icon: Moon },
  { path: "/learn", label: "Learn", icon: BookOpen },
  { path: "/journal", label: "Journal", icon: NotebookPen },
];

const moreItems: NavItem[] = [
  { path: "/objects", label: "Objects", icon: Eye },
  { path: "/events/explore", label: "Events", icon: Calendar },
  { path: "/explore", label: "Explore hub", icon: Compass },
  { path: "/favorites", label: "Favorites", icon: Heart },
  { path: "/planetarium", label: "Planetarium", icon: Globe },
  { path: "/live-sky", label: "Live Sky", icon: Smartphone },
  { path: "/sky", label: "Sky Map", icon: Compass },
  { path: "/time-travel", label: "Time Travel", icon: Clock },
  { path: "/compare", label: "Compare", icon: ArrowLeftRight },
  { path: "/astro", label: "Astro", icon: Upload },
  { path: "/sky-data", label: "Sky Data", icon: Database },
  { path: "/sky-network", label: "Network", icon: Radio },
  { path: "/session-planner", label: "Session Planner", icon: Calendar },
  { path: "/programs", label: "Programs", icon: Target },
];

function isActive(path: string, current: string): boolean {
  return current === path || (path !== "/" && current.startsWith(path));
}

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { nightVision, toggleNightVision } = useNightVision();
  const { user } = useAuth();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]"
      aria-label="Main navigation"
    >
      <div className="container flex items-center justify-between min-h-14 sm:min-h-16 px-3 sm:px-4 gap-2 min-w-0">
        <Link
          to="/"
          className="flex items-center gap-2 group min-h-[44px] min-w-[44px] items-center justify-center -m-2 p-2 rounded-lg hover:bg-muted/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background shrink-0"
          aria-label="Alnitar home"
        >
          <img src={alnitarLogo} alt="" className="w-7 h-7 transition-transform group-hover:rotate-12" aria-hidden />
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight hidden sm:inline">
            Alni<span className="text-primary">tar</span>
          </span>
        </Link>

        {/* Desktop: primary + More dropdown + Account + Night vision */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-3xl">
          {primaryItems.map((item) => {
            const active = isActive(item.path, location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative min-h-[44px] flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <item.icon className="w-4 h-4 shrink-0" aria-hidden />
                  {item.label}
                </span>
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:bg-muted/50 data-[state=open]:text-foreground"
              aria-haspopup="true"
              aria-expanded="undefined"
            >
              More
              <ChevronDown className="w-4 h-4 shrink-0" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[11rem]">
              {moreItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                    <item.icon className="w-4 h-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden lg:flex items-center gap-0.5 shrink-0">
          <Link
            to={user ? "/profile" : "/login"}
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <User className="w-4 h-4" aria-hidden />
            {user ? "Account" : "Sign In"}
          </Link>
          <button
            type="button"
            onClick={toggleNightVision}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              nightVision ? "text-red-400 bg-red-400/10" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Night Vision Mode"
            aria-label={nightVision ? "Disable night vision mode" : "Enable night vision mode"}
          >
            <Eye className="w-4 h-4" aria-hidden />
          </button>
        </div>

        {/* Mobile: menu + night vision + hamburger */}
        <div className="flex lg:hidden items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={toggleNightVision}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              nightVision ? "text-red-400" : "text-muted-foreground"
            }`}
            aria-label={nightVision ? "Disable night vision mode" : "Enable night vision mode"}
          >
            <Eye className="w-5 h-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu: chunked by category (recognition over recall, aesthetic) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            role="dialog"
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-y-auto max-h-[min(70vh,400px)] overscroll-contain min-w-0"
          >
            <div className="container py-3 flex flex-col gap-4 min-w-0">
              <section aria-label="Main">
                <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main</p>
                <div className="flex flex-col gap-0.5">
                  {primaryItems.map((item) => {
                    const active = isActive(item.path, location.pathname);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 min-h-[48px] min-w-0 px-4 py-3 rounded-lg text-base font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background break-words ${
                          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        }`}
                      >
                        <item.icon className="w-5 h-5 shrink-0" aria-hidden />
                        <span className="min-w-0 break-words">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
              <section aria-label="Explore & tools">
                <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore & tools</p>
                <div className="flex flex-col gap-0.5">
                  {moreItems.map((item) => {
                    const active = isActive(item.path, location.pathname);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 min-h-[48px] min-w-0 px-4 py-3 rounded-lg text-base font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background break-words ${
                          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        }`}
                      >
                        <item.icon className="w-5 h-5 shrink-0" aria-hidden />
                        <span className="min-w-0 break-words">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
              <div className="border-t border-border/30 pt-3">
                <Link
                  to={user ? "/profile" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 min-h-[48px] min-w-0 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <User className="w-5 h-5 shrink-0" aria-hidden />
                  {user ? "Account" : "Sign In"}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
