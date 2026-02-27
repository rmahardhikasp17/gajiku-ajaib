import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import BudgetPage from "./pages/BudgetPage";
import SavingsPage from "./pages/SavingsPage";
import ReportPage from "./pages/ReportPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import PinLock from "./components/PinLock";
import { PWAUpdateBanner, PWAInstallBanner } from "./components/PWAPrompts";
import { useSettings } from "./hooks/useSettings";

const queryClient = new QueryClient();

const AppContent = () => {
  const { settings, loading } = useSettings();
  const [locked, setLocked] = useState(false);
  const [checkedPin, setCheckedPin] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (settings.pinEnabled && settings.pinHash) {
        setLocked(true);
      }
      setCheckedPin(true);
    }
  }, [loading, settings.pinEnabled, settings.pinHash]);

  // Terapkan tema ke document
  useEffect(() => {
    if (loading) return;
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme, loading]);

  if (loading || !checkedPin) {
    return (
      <div className="mx-auto max-w-md min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Memuat GAJIKU...</p>
        </div>
      </div>
    );
  }

  if (locked) {
    return <PinLock onUnlock={() => setLocked(false)} />;
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background relative">
      {/* PWA banners */}
      <PWAUpdateBanner />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <BottomNav />

      {/* Install prompt */}
      <PWAInstallBanner />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
