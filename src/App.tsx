import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Search from "./pages/Search";
import Playlists from "./pages/Playlists";
import Playlist from "./pages/Playlist";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  const { loading } = useTelegramAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
     <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
     <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
     <Route path="/search" element={<Search />} />
     <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
     <Route path="/playlist/:id" element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
