import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        
        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Index />} />
          {/* Adicione outras rotas protegidas aqui */}
        </Route>
        
        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
