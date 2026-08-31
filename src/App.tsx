import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrganizationProvider } from "@/contexts/OrganizationProvider";
import Index from "./pages/Index";
import { Store } from "./pages/Store";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { AcceptInvitation } from "./pages/AcceptInvitation";
import PublicAccountStatement from "./pages/PublicAccountStatement";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <OrganizationProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="/tienda/:slug/cuenta/:token" element={<PublicAccountStatement />} />
          <Route path="/tienda/:slug" element={
            <ProtectedRoute>
              <Store />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </OrganizationProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export { App };
