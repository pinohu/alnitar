import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Upload, Compass, BookOpen, NotebookPen, Moon, Camera, ArrowLeftRight, Eye, Globe, Smartphone, Radio, Clock, Database, User } from "lucide-react";
import { useNightVision } from "@/contexts/NightVisionContext";
import { useAuth } from "@/contexts/AuthContext";
import alnitarLogo from "@/assets/alnitar-logo.png";

const navItems = [
  { path: "/recognize", label: "Cosmic Camera", icon: Camera },
  { path: "/tonight", label: "Tonight", icon: Moon },
  { path: "/planetarium", label: "Planetarium", icon: Globe },
  { path: "/live-sky", label: "Live Sky", icon: Smartphone },
  { path: "/sky-network", label: "Network", icon: Radio },
  { path: "/time-travel", label: "Time Travel", icon: Clock },
  { path: "/sky", label: "Sky Map", icon: Compass },
  { path: "/learn", label: "Learn", icon: BookOpen },
  { path: "/compare", label: "Compare", icon: ArrowLeftRight },
  { path: "/astro", label: "Astro", icon: Upload },
  { path: "/journal", label: "Journal", icon: NotebookPen },
  { path: "/sky-data", label: "Sky Data", icon: Database },
];

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
      <div className="container flex items-center justify-between min-h-14 sm:min-h-16 px-3 sm:px-4">
        <Link
          to="/"
          className="flex items-center gap-2 group min-h-[44px] min-w-[44px] items-center justify-center -m-2 p-2 rounded-lg hover:bg-muted/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Alnitar home"
        >
          <img src={alnitarLogo} alt="" className="w-7 h-7 transition-transform group-hover:rotate-12" aria-hidden />
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight">
            Alni<span className="text-primary">tar</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navItems.map(item => {
            const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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
          <Link
            to={user ? "/profile" : "/login"}
            className="ml-1 min-h-[44px] flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

        {/* Mobile: actions (Fitts's Law — minimum 44px touch targets) */}
        <div className="flex lg:hidden items-center gap-0.5">
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

      {/* Mobile menu (scrollable, chunked — Miller's Law; 44px tap targets) */}
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
            className="lg:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-y-auto max-h-[min(70vh,400px)] overscroll-contain"
          >
            <div className="container py-3 flex flex-col gap-0.5">
              {navItems.map(item => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 min-h-[48px] px-4 py-3 rounded-lg text-base font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 active:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-border/30 mt-2 pt-2">
                <Link
                  to={user ? "/profile" : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 min-h-[48px] px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 active:bg-muted/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
