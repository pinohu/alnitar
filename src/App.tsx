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
const LearnPathsPage = lazy(() => import("./pages/LearnPathsPage.tsx"));
const ConstellationDetailPage = lazy(() => import("./pages/ConstellationDetailPage.tsx"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage.tsx"));
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
const EventsPage = lazy(() => import("./pages/EventsPage.tsx"));
const SkyThroughTimePage = lazy(() => import("./pages/SkyThroughTimePage.tsx"));
const SkyDataPage = lazy(() => import("./pages/SkyDataPage.tsx"));
const SupportPage = lazy(() => import("./pages/SupportPage.tsx"));
const PricingPage = lazy(() => import("./pages/PricingPage.tsx"));
const PartnersPage = lazy(() => import("./pages/PartnersPage.tsx"));
const ResearchApiPage = lazy(() => import("./pages/ResearchApiPage.tsx"));
const AlignScopePage = lazy(() => import("./pages/AlignScopePage.tsx"));
const ExplorePage = lazy(() => import("./pages/ExplorePage.tsx"));
const CatalogPage = lazy(() => import("./pages/CatalogPage.tsx"));
const SeedObjectDetailPage = lazy(() => import("./pages/SeedObjectDetailPage.tsx"));
const ObjectExplorerPage = lazy(() => import("./pages/ObjectExplorerPage.tsx"));
const ObjectDetailBySlugPage = lazy(() => import("./pages/ObjectDetailBySlugPage.tsx"));
const EventExplorerPage = lazy(() => import("./pages/EventExplorerPage.tsx"));
const EventDetailBySlugPage = lazy(() => import("./pages/EventDetailBySlugPage.tsx"));
const CelestialExplorerPage = lazy(() => import("./pages/CelestialExplorerPage.tsx"));
const DeepSkyObjectDetailPage = lazy(() => import("./pages/DeepSkyObjectDetailPage.tsx"));
const SolarSystemPage = lazy(() => import("./pages/SolarSystemPage.tsx"));
const EventSimulatePage = lazy(() => import("./pages/EventSimulatePage.tsx"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage.tsx"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage.tsx"));
const CampaignsPage = lazy(() => import("./pages/CampaignsPage.tsx"));
const SessionPlannerPage = lazy(() => import("./pages/SessionPlannerPage.tsx"));
const ProgramsPage = lazy(() => import("./pages/ProgramsPage.tsx"));
const YearInReviewPage = lazy(() => import("./pages/YearInReviewPage.tsx"));
const LegalPage = lazy(() => import("./pages/LegalPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const basename = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") || "/";

function PageFallback() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      <div className="container max-w-6xl space-y-8 px-4 pt-24 pb-16">
        <div className="h-40 rounded-2xl bg-muted/30 border border-border/30" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted/30 border border-border/30" />
          ))}
        </div>
      </div>
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
                <Route path="/learn/paths" element={<LearnPathsPage />} />
                <Route path="/learn/:slug" element={<ConstellationDetailPage />} />
                <Route path="/profile/:userId" element={<PublicProfilePage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/journal/year-in-review" element={<YearInReviewPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/tonight" element={<TonightPage />} />
                <Route path="/session-planner" element={<SessionPlannerPage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/astro" element={<AstroPage />} />
                <Route path="/planetarium" element={<PlanetariumPage />} />
                <Route path="/live-sky" element={<LiveSkyPage />} />
                <Route path="/sky-network" element={<SkyNetworkPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/time-travel" element={<SkyThroughTimePage />} />
                <Route path="/sky-data" element={<SkyDataPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/research" element={<ResearchApiPage />} />
                <Route path="/align" element={<AlignScopePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/explore/catalog" element={<CatalogPage />} />
                <Route path="/object/:id" element={<SeedObjectDetailPage />} />
                <Route path="/objects" element={<ObjectExplorerPage />} />
                <Route path="/objects/:slug" element={<ObjectDetailBySlugPage />} />
                <Route path="/events/explore" element={<EventExplorerPage />} />
                <Route path="/events/explore/:slug" element={<EventDetailBySlugPage />} />
                <Route path="/explore/objects" element={<CelestialExplorerPage />} />
                <Route path="/explore/object/dso/:id" element={<DeepSkyObjectDetailPage />} />
                <Route path="/explore/solar-system" element={<SolarSystemPage />} />
                <Route path="/events/simulate" element={<EventSimulatePage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
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
