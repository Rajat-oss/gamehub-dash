import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { LandingPage } from "./pages/LandingPage";
import Index from "./pages/Index";
import Favorites from "./pages/Favorites";
import MyGames from "./pages/MyGames";
import GameDetails from "./pages/GameDetails";
import Profile from "./pages/Profile";
import PublicProfiles from "./pages/PublicProfiles";
import UserProfilePage from "./pages/UserProfile";
import Community from "./pages/Community";
import Notifications from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import Chat from "./pages/Chat";
import ChatInbox from "./pages/ChatInbox";
import Posts from "./pages/Posts";
import NotFound from "./pages/NotFound";
import "@/utils/emailTest"; // Import email test utility
import "@/utils/verifyTemplate"; // Import template verification utility

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Index />} />
        <Route path="/homepage" element={<Index />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/my-games" element={<MyGames />} />
        <Route path="/game/:gameId" element={<GameDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/community" element={<Community />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/user/:username" element={<UserProfilePage />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/inbox" element={<ChatInbox />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const NotificationWrapper = () => {
  useNotificationListener();
  return <AppContent />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <NotificationWrapper />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;