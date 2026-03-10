import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { NightVisionProvider } from "@/contexts/NightVisionContext";
import Index from "./pages/Index.tsx";
import RecognizePage from "./pages/RecognizePage.tsx";
import SkyPage from "./pages/SkyPage.tsx";
import LearnPage from "./pages/LearnPage.tsx";
import ConstellationDetailPage from "./pages/ConstellationDetailPage.tsx";
import JournalPage from "./pages/JournalPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import TonightPage from "./pages/TonightPage.tsx";
import ComparePage from "./pages/ComparePage.tsx";
import AstroPage from "./pages/AstroPage.tsx";
import PlanetariumPage from "./pages/PlanetariumPage.tsx";
import LiveSkyPage from "./pages/LiveSkyPage.tsx";
import SkyNetworkPage from "./pages/SkyNetworkPage.tsx";
import SkyThroughTimePage from "./pages/SkyThroughTimePage.tsx";
import SkyDataPage from "./pages/SkyDataPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NightVisionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NightVisionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
