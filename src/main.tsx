import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

registerSW({ immediate: true });

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
