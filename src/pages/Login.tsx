import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import LogoImage from '@/lib/assets/Logo.png';
import { useNavigate, Link } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, isOffline } = useSupabase();

  // Verificar tamanho da tela para responsividade
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar na inicialização
    checkScreenSize();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Exibir alerta se estiver em modo offline
  useEffect(() => {
    if (isOffline) {
      toast({
        title: "Modo offline ativado",
        description: "Você está operando em modo offline. Algumas funcionalidades podem estar limitadas.",
        variant: "default"
      });
    }
  }, [isOffline]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password) {
      setError("Por favor, preencha todos os campos");
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Tentando login com:', email);
      console.log('Modo offline:', isOffline ? 'Ativo' : 'Inativo');
      
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Erro de autenticação:", error.message);
        
        // Traduzir mensagens de erro comuns para português
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciais inválidas. Verifique seu email e senha.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Falha na conexão com o servidor. Verifique sua internet.');
        } else {
          throw new Error(error.message);
        }
      }
      
      // Login bem-sucedido, redirecionar para o sistema
      handleLoginSuccess();
    } catch (err) {
      console.error("Erro detalhado:", err);
      
      // Se houver problema de conexão, use modo offline
      if (err instanceof Error && 
          (err.message.includes('Failed to fetch') || 
           err.message.includes('Network') || 
           err.message.includes('ERR_NAME_NOT_RESOLVED'))) {
        console.warn("Problema de conexão detectado. Usando modo offline...");
        handleOfflineLogin();
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : "Falha na autenticação";
      setError(errorMessage);
      
      toast({
        title: "Erro de login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com login bem-sucedido
  const handleLoginSuccess = () => {
    toast({
      title: "Login bem-sucedido",
      description: "Redirecionando para o sistema...",
      variant: "default"
    });
    
    navigate('/sistema');
  };

  // Função para lidar com login no modo offline
  const handleOfflineLogin = () => {
    if (isOffline) {
      toast({
        title: "Modo offline ativado",
        description: "Logado em modo offline. Algumas funcionalidades estarão limitadas.",
        variant: "default"
      });
    } else {
      toast({
        title: "Modo de contingência ativado",
        description: "Problemas de conexão detectados. Usando modo offline.",
        variant: "default"
      });
    }
    
    navigate('/sistema');
  };

  return (
    <div className="min-h-screen flex flex-col bg-pharmacy-dark1">
      {/* Layout mobile: logo acima, formulário abaixo */}
      {isMobile ? (
        <>
          {/* Cabeçalho com logo */}
          <div className="flex flex-col items-center justify-center p-6 pt-10 pb-2">
            <div className="w-24 h-24 mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pharmacy-accent via-pharmacy-green1 to-pharmacy-green2 rounded-full opacity-40 blur-md"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={LogoImage} 
                  alt="Logo Saíra" 
                  className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(145,146,92,0.6)]"
                />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white">
              <span className="text-pharmacy-green2">Saíra</span>
            </h2>
            <h1 className="text-2xl font-bold text-white mt-4 mb-2 text-center">Bem-vindo!</h1>
            <p className="text-sm text-pharmacy-green2 mb-4 text-center max-w-xs">
              Acesse sua conta para gerenciar seus clientes e impulsionar suas vendas.
            </p>
          </div>

          {/* Formulário de login */}
          <div className="flex-1 flex items-start justify-center px-4 pb-6">
            <div className="w-full max-w-md">
              <div className="bg-pharmacy-dark2 rounded-xl p-5 shadow-lg">
                <h2 className="text-lg font-bold text-white mb-1">Entrar</h2>
                <p className="text-xs text-pharmacy-green2 mb-4">Informe seus dados para acessar sua conta</p>
                
                {isOffline && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-200 text-sm">
                    Você está no modo offline. Algumas funcionalidades podem estar limitadas.
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white" htmlFor="email">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Seu email"
                          className="pl-10 bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1 [&:-webkit-autofill]:!bg-pharmacy-dark1 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#344d4a_inset] [&:-webkit-autofill]:[filter:brightness(1.1)_contrast(1.1)] [-webkit-text-fill-color:white] input-autofill"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="username"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white" htmlFor="password">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          className="pl-10 pr-10 bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1 [&:-webkit-autofill]:!bg-pharmacy-dark1 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#344d4a_inset]"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={toggleShowPassword}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-pharmacy-green2" />
                          ) : (
                            <Eye className="h-4 w-4 text-pharmacy-green2" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Link to="/esqueci-senha" className="text-pharmacy-accent hover:underline text-xs">
                        Esqueceu sua senha?
                      </Link>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
                      disabled={loading}
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                    
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-pharmacy-dark1"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-pharmacy-dark2 px-2 text-xs text-pharmacy-green2">ou</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-pharmacy-green2 text-xs">Não tem uma conta? </span>
                      <Link to="/registro" className="text-pharmacy-accent hover:underline text-xs">
                        Criar conta
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Layout desktop: lado a lado
        <div className="min-h-screen flex flex-row">
          {/* Lado esquerdo - Mensagem de boas-vindas */}
          <div className="w-1/2 p-12 flex flex-col justify-center items-center">
            <div className="max-w-md text-left">
              <h1 className="text-5xl font-bold text-white mb-6">Bem-vindo!</h1>
              <p className="text-xl text-pharmacy-green2 mb-10 leading-relaxed">
                Acesse sua conta para gerenciar seus clientes e impulsionar suas vendas.
              </p>
              
              <div className="flex flex-col items-center mt-20">
                <div className="w-36 h-36 mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pharmacy-accent via-pharmacy-green1 to-pharmacy-green2 rounded-full opacity-40 blur-md"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={LogoImage} 
                      alt="Logo Saíra" 
                      className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(145,146,92,0.6)]"
                    />
                  </div>
                </div>
                <h2 className="text-3xl font-semibold text-white">
                  <span className="text-pharmacy-green2">Saíra</span>
                </h2>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário de login */}
          <div className="w-1/2 bg-pharmacy-dark2 p-12 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-pharmacy-dark1 rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-2">Entrar</h2>
                <p className="text-base text-pharmacy-green2 mb-6">Informe seus dados para acessar sua conta</p>
                
                {isOffline && (
                  <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-200">
                    Você está no modo offline. Algumas funcionalidades podem estar limitadas.
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleLogin}>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white" htmlFor="email">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Seu email"
                          className="pl-10 bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark2 [&:-webkit-autofill]:!bg-pharmacy-dark2 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#3a4543_inset] [&:-webkit-autofill]:[filter:brightness(1.1)_contrast(1.1)] [-webkit-text-fill-color:white] input-autofill"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="username"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white" htmlFor="password">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          className="pl-10 pr-10 bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark2 [&:-webkit-autofill]:!bg-pharmacy-dark2 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_#3a4543_inset]"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={toggleShowPassword}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-pharmacy-green2" />
                          ) : (
                            <Eye className="h-4 w-4 text-pharmacy-green2" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Link to="/esqueci-senha" className="text-pharmacy-accent hover:underline text-sm">
                        Esqueceu sua senha?
                      </Link>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
                      disabled={loading}
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                    
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-pharmacy-dark2"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-pharmacy-dark1 px-2 text-xs text-pharmacy-green2">ou</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-pharmacy-green2 text-sm">Não tem uma conta? </span>
                      <Link to="/registro" className="text-pharmacy-accent hover:underline">
                        Criar conta
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login; 