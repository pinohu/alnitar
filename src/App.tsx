import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { NightVisionProvider } from "@/contexts/NightVisionContext";

const Index = lazy(() => import("./pages/Index.tsx"));
const RecognizePage = lazy(() => import("./pages/RecognizePage.tsx"));
const SkyPage = lazy(() => import("./pages/SkyPage.tsx"));
const LearnPage = lazy(() => import("./pages/LearnPage.tsx"));
const ConstellationDetailPage = lazy(() => import("./pages/ConstellationDetailPage.tsx"));
const JournalPage = lazy(() => import("./pages/JournalPage.tsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.tsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));
const TonightPage = lazy(() => import("./pages/TonightPage.tsx"));
const ComparePage = lazy(() => import("./pages/ComparePage.tsx"));
const AstroPage = lazy(() => import("./pages/AstroPage.tsx"));
const PlanetariumPage = lazy(() => import("./pages/PlanetariumPage.tsx"));
const LiveSkyPage = lazy(() => import("./pages/LiveSkyPage.tsx"));
const SkyNetworkPage = lazy(() => import("./pages/SkyNetworkPage.tsx"));
const SkyThroughTimePage = lazy(() => import("./pages/SkyThroughTimePage.tsx"));
const SkyDataPage = lazy(() => import("./pages/SkyDataPage.tsx"));
const SupportPage = lazy(() => import("./pages/SupportPage.tsx"));
const PricingPage = lazy(() => import("./pages/PricingPage.tsx"));
const PartnersPage = lazy(() => import("./pages/PartnersPage.tsx"));
const LegalPage = lazy(() => import("./pages/LegalPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const basename = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") || "/";

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NightVisionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={basename}>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/recognize" element={<RecognizePage />} />
                <Route path="/sky" element={<SkyPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/:slug" element={<ConstellationDetailPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/tonight" element={<TonightPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/astro" element={<AstroPage />} />
                <Route path="/planetarium" element={<PlanetariumPage />} />
                <Route path="/live-sky" element={<LiveSkyPage />} />
                <Route path="/sky-network" element={<SkyNetworkPage />} />
                <Route path="/time-travel" element={<SkyThroughTimePage />} />
                <Route path="/sky-data" element={<SkyDataPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/disclaimer" element={<LegalPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </NightVisionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
