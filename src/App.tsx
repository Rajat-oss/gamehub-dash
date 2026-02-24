import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { cleanupService } from "@/services/cleanupService";
import { useEffect, lazy, Suspense } from "react";
import { SmoothScroll } from "@/components/SmoothScroll";

// ─── Eagerly loaded (critical path only) ───────────────────────────────────
import { LandingPage } from "./pages/LandingPage";

// ─── Lazy loaded (all non-landing routes) ──────────────────────────────────
const AboutUs          = lazy(() => import("./pages/AboutUs").then(m => ({ default: m.AboutUs })));
const Pricing          = lazy(() => import("./pages/Pricing").then(m => ({ default: m.Pricing })));
const PrivacyPolicy    = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService   = lazy(() => import("./pages/TermsOfService").then(m => ({ default: m.TermsOfService })));
const Index            = lazy(() => import("./pages/Index"));
const Favorites        = lazy(() => import("./pages/Favorites"));
const MyGames          = lazy(() => import("./pages/MyGames"));
const GameDetails      = lazy(() => import("./pages/GameDetails"));
const Profile          = lazy(() => import("./pages/Profile"));
const UserProfilePage  = lazy(() => import("./pages/UserProfile"));
const Community        = lazy(() => import("./pages/Community"));
const Notifications    = lazy(() => import("./pages/Notifications"));
const Settings         = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Chat             = lazy(() => import("./pages/Chat"));
const ChatInbox        = lazy(() => import("./pages/ChatInbox"));
const Posts            = lazy(() => import("./pages/Posts"));
const Discussions      = lazy(() => import("./pages/Discussions"));
const DiscussionDetails = lazy(() => import("./pages/DiscussionDetails"));
const Contact          = lazy(() => import("./pages/Contact"));
const SearchResults    = lazy(() => import("./pages/SearchResults"));
const NotFound         = lazy(() => import("./pages/NotFound"));

/** Minimal fallback while a lazy chunk loads */
const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 min — reduce background refetches
      gcTime: 10 * 60 * 1000,
    },
  },
});

const AppContent = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/"                         element={<LandingPage />} />
          <Route path="/about"                    element={<AboutUs />} />
          <Route path="/pricing"                  element={<Pricing />} />
          <Route path="/privacy"                  element={<PrivacyPolicy />} />
          <Route path="/terms"                    element={<TermsOfService />} />
          <Route path="/auth"                     element={<Index />} />
          <Route path="/homepage"                 element={<Index />} />
          <Route path="/favorites"                element={<Favorites />} />
          <Route path="/my-games"                 element={<MyGames />} />
          <Route path="/game/:gameId"             element={<GameDetails />} />
          <Route path="/profile"                  element={<Profile />} />
          <Route path="/settings"                 element={<Settings />} />
          <Route path="/community"                element={<Community />} />
          <Route path="/notifications"            element={<Notifications />} />
          <Route path="/user/:username"           element={<UserProfilePage />} />
          <Route path="/posts"                    element={<Posts />} />
          <Route path="/discussions"              element={<Discussions />} />
          <Route path="/discussions/:discussionId" element={<DiscussionDetails />} />
          <Route path="/chat/:userId"             element={<Chat />} />
          <Route path="/inbox"                    element={<ChatInbox />} />
          <Route path="/contact"                  element={<Contact />} />
          <Route path="/search"                   element={<SearchResults />} />
          <Route path="*"                         element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const NotificationWrapper = () => {
  useNotificationListener();

  useEffect(() => {
    const stopCleanup = cleanupService.startStoryCleanup();
    return stopCleanup;
  }, []);

  return <AppContent />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <SmoothScroll>
              <Toaster />
              <Sonner />
              <NotificationWrapper />
            </SmoothScroll>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;