import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn("[Alnitar] 404:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-20">
        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Error 404</p>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Page not found</h1>
          <p className="mb-8 max-w-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Compass className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
