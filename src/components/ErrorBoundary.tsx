// src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.PROD) {
      // In production, send to error reporting service (e.g. Sentry)
      console.error("[Alnitar] ErrorBoundary caught:", error, info.componentStack);
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" aria-hidden />
          <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            We're sorry. The app hit an error. Please try again or return home.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild>
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
