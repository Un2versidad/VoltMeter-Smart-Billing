import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Consumo from "./pages/Consumo";
import Facturacion from "./pages/Facturacion";
import Alertas from "./pages/Alertas";
import Oficinas from "./pages/Oficinas";
import Plano from "./pages/Plano";
import Proteccion from "./pages/Proteccion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/plano" element={<Plano />} />
            <Route path="/consumo" element={<Consumo />} />
            <Route path="/facturacion" element={<Facturacion />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/oficinas" element={<Oficinas />} />
            <Route path="/proteccion" element={<Proteccion />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
