import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

/**
 * Componente para proteger rotas que exigem autenticação
 */
export const ProtectedRoute = () => {
  const { user, loading, isOffline, forceConnectionCheck } = useSupabase();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Verificar se está no modo de preview
  const isPreviewMode = location.pathname === '/preview';

  // Tentar reconectar quando offline
  useEffect(() => {
    if (isOffline && retryCount < 3) {
      const timer = setTimeout(() => {
        handleRetryConnection();
      }, 5000); // Tentar a cada 5 segundos
      
      return () => clearTimeout(timer);
    }
  }, [isOffline, retryCount]);

  // Função para tentar reconectar manualmente
  const handleRetryConnection = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    toast({
      title: "Verificando conexão",
      description: "Tentando estabelecer conexão com o servidor...",
      variant: "default"
    });
    
    try {
      await forceConnectionCheck();
      setRetryCount(prev => prev + 1);
      
      if (!isOffline) {
        toast({
          title: "Conexão restabelecida",
          description: "A conexão com o servidor foi restabelecida com sucesso.",
          variant: "default"
        });
      } else if (retryCount >= 2) {
        toast({
          title: "Modo offline ativado",
          description: "Não foi possível conectar ao servidor. Usando modo offline.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Enquanto verifica o status de autenticação, exibe um loader
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-pharmacy-dark1">
        <Loader2 className="h-8 w-8 text-pharmacy-accent animate-spin mb-4" />
        <p className="text-pharmacy-green2 mb-2">Verificando autenticação...</p>
        
        {isOffline && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-yellow-300 mb-4">Problemas de conexão detectados</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90"
              onClick={handleRetryConnection}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Se não estiver autenticado e não estiver no modo de visualização, redireciona para a página de login
  if (!user && !isPreviewMode) {
    // Se estiver offline e tentar mais de 3 vezes, vai para o dashboard em modo offline
    if (isOffline && retryCount >= 3) {
      toast({
        title: "Modo offline ativado",
        description: "O aplicativo está funcionando em modo offline com funcionalidades limitadas.",
        variant: "default"
      });
      return <Outlet />;
    }
    
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado ou no modo de visualização, renderiza o conteúdo da rota
  return <Outlet />;
}; 