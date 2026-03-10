import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Upload, Compass, BookOpen, NotebookPen, Moon, Camera, ArrowLeftRight, Eye, Globe, Smartphone, Radio, Clock, Database } from "lucide-react";
import { useNightVision } from "@/contexts/NightVisionContext";
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={alnitarLogo} alt="Alnitar" className="w-7 h-7 transition-transform group-hover:rotate-12" />
          <span className="font-display text-xl font-bold tracking-tight">
            Alni<span className="text-primary">tar</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
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
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={toggleNightVision}
            className={`ml-2 p-2 rounded-lg transition-colors ${nightVision ? "text-red-400 bg-red-400/10" : "text-muted-foreground hover:text-foreground"}`}
            title="Night Vision Mode"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={toggleNightVision}
            className={`p-2 rounded-lg ${nightVision ? "text-red-400" : "text-muted-foreground"}`}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navItems.map(item => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
