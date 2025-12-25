import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import HomePage from "./pages/HomePage";
import PublicOrder from "./pages/PublicOrder";
import PublicOrderRamadan from "./pages/PublicOrderRamadan";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const SubdomainRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show homepage directly on commande.maisondugout.ma
    if (window.location.hostname === 'commande.maisondugout.ma' && window.location.pathname === '/') {
      navigate('/acceuil', { replace: true });
    }
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SubdomainRedirect />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/acceuil" element={<HomePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/commande" element={<PublicOrder />} />
          <Route path="/ramadan" element={<PublicOrderRamadan />} />
          <Route path="/admin" element={<Index />} />
          <Route path="/admin/users" element={<Users />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
