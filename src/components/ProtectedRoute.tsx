import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Loader2 } from "lucide-react";

/**
 * Componente para proteger rotas que exigem autenticação
 */
export const ProtectedRoute = () => {
  const { user, loading } = useSupabase();
  const location = useLocation();
  
  // Verificar se está no modo de preview
  const isPreviewMode = location.pathname === '/preview';

  // Enquanto verifica o status de autenticação, exibe um loader
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-pharmacy-dark1">
        <Loader2 className="h-8 w-8 text-pharmacy-accent animate-spin" />
      </div>
    );
  }

  // Se não estiver autenticado e não estiver no modo de visualização, redireciona para a página de login
  if (!user && !isPreviewMode) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado ou no modo de visualização, renderiza o conteúdo da rota
  return <Outlet />;
}; 