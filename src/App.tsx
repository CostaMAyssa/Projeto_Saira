import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { SupabaseProvider } from "./contexts/SupabaseContext";
import { UnreadMessagesProvider } from "./contexts/UnreadMessagesContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PublicForm from "./pages/PublicForm";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <SupabaseProvider>
    <QueryClientProvider client={queryClient}>
      <UnreadMessagesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/public/forms/:id" element={<PublicForm />} />

            {/* Rota protegida principal */}
            <Route element={<ProtectedRoute />}>
              <Route path="/sistema" element={<Index />} />
            </Route>

            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </UnreadMessagesProvider>
    </QueryClientProvider>
  </SupabaseProvider>
);

export default App;
