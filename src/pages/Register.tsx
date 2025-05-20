import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, User, UserCheck, RefreshCw } from 'lucide-react';
import LogoImage from '@/lib/assets/Logo.png';
import { useNavigate, Link } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from "@/components/ui/use-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('agent');
  const [status, setStatus] = useState('ativo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  
  const navigate = useNavigate();
  const { signUp, isOffline, forceConnectionCheck } = useSupabase();

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

  // Forçar verificação de conexão na inicialização
  useEffect(() => {
    const doConnectionCheck = async () => {
      setCheckingConnection(true);
      await forceConnectionCheck();
      setCheckingConnection(false);
    };
    
    doConnectionCheck();
  }, [forceConnectionCheck]);

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

  const handleCheckConnection = async () => {
    setCheckingConnection(true);
    setError(null);
    toast({
      title: "Verificando conexão",
      description: "Aguarde enquanto verificamos a conexão com o servidor...",
      variant: "default"
    });
    
    await forceConnectionCheck();
    
    if (!isOffline) {
      toast({
        title: "Conexão verificada",
        description: "A conexão com o servidor está funcionando normalmente.",
        variant: "default"
      });
    } else {
      toast({
        title: "Problema de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente mais tarde.",
        variant: "destructive"
      });
    }
    
    setCheckingConnection(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Validações básicas
      if (!name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!email.trim()) {
        throw new Error('Email é obrigatório');
      }
      
      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      console.log('Enviando registro com dados:', { name, email, role, status });
      console.log('Modo offline:', isOffline ? 'Ativo' : 'Inativo');
      
      try {
        const { error } = await signUp(email, password, {
          name: name.trim(),
          role,
          status
        });
        
        if (error) {
          console.error('Erro retornado pelo Supabase:', error);
          
          // Traduzir mensagens de erro comuns
          if (error.message.includes('Email already registered')) {
            throw new Error('Este email já está registrado');
          } else if (error.message.includes('Password should be at least')) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
          } else if (error.message.includes('Invalid email')) {
            throw new Error('Email inválido');
          } else if (error.message.includes('Failed to fetch') || error.message.includes('Falha na conexão')) {
            // Forçar verificação de conexão
            await forceConnectionCheck();
            
            if (isOffline) {
              // Se estiver offline, tentar registro offline
              handleDemoSuccess();
            } else {
              throw new Error('Falha na conexão com o servidor. Tente novamente.');
            }
            return;
          } else {
            throw new Error(error.message);
          }
        }
        
        // Sucesso
        handleSuccess();
      } catch (err) {
        if (err instanceof Error && 
            (err.message.includes('Failed to fetch') || 
             err.message.includes('Network') || 
             err.message.includes('ERR_NAME_NOT_RESOLVED'))) {
          console.warn('Problema de conexão. Ativando modo de contingência...');
          // Forçar verificação de conexão
          await forceConnectionCheck();
          handleDemoSuccess();
          return;
        }
        
        throw err;
      }
    } catch (err) {
      console.error('Erro durante o registro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro durante o registro';
      setError(errorMessage);
      
      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com sucesso real
  const handleSuccess = () => {
    setSuccess(true);
    toast({
      title: "Registro bem-sucedido",
      description: "Sua conta foi criada com sucesso. Redirecionando para a página de login...",
      variant: "default"
    });
    
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  // Função para lidar com sucesso no modo de demonstração
  const handleDemoSuccess = () => {
    setSuccess(true);
    
    if (isOffline) {
      toast({
        title: "Modo offline ativado",
        description: "Conta criada no modo offline. Redirecionando para o dashboard...",
        variant: "default"
      });
    } else {
      toast({
        title: "Modo de contingência ativado",
        description: "Problemas de conexão detectados. Usando modo de demonstração. Redirecionando para o dashboard...",
        variant: "default"
      });
    }
    
    // No modo de demonstração, vamos direto para o dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
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
            <h1 className="text-2xl font-bold text-white mt-4 mb-2 text-center">Cadastro</h1>
            <p className="text-sm text-pharmacy-green2 mb-4 text-center max-w-xs">
              Crie sua conta para gerenciar seus clientes e impulsionar suas vendas.
            </p>
          </div>

          {/* Formulário de cadastro */}
          <div className="flex-1 flex items-start justify-center px-4 pb-6">
            <div className="w-full max-w-md">
              <div className="bg-pharmacy-dark2 rounded-xl p-5 shadow-lg">
                <h2 className="text-lg font-bold text-white mb-1">Criar conta</h2>
                <p className="text-xs text-pharmacy-green2 mb-4">Preencha os campos abaixo para se cadastrar</p>
                
                {isOffline && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-200 text-sm">
                    Você está no modo offline. Seus dados serão salvos localmente.
                    <Button 
                      onClick={handleCheckConnection} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full text-xs"
                      disabled={checkingConnection}
                    >
                      {checkingConnection ? 
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : 
                        <RefreshCw className="h-3 w-3 mr-1" />
                      }
                      Verificar conexão
                    </Button>
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200 text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-200 text-sm">
                    Conta criada com sucesso! Redirecionando...
                  </div>
                )}
                
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white" htmlFor="name">
                        Nome
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          className="pl-10 bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Email */}
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
                          className="pl-10 bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="username"
                        />
                      </div>
                    </div>
                    
                    {/* Senha */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white" htmlFor="password">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Crie uma senha"
                          className="pl-10 pr-10 bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
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
                    
                    {/* Função */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white" htmlFor="role">
                        Função
                      </label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1">
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                        <SelectContent className="bg-pharmacy-dark1 border-pharmacy-dark1 text-white">
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="agent">Atendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Status (oculto, definido como ativo por padrão) */}
                    <input type="hidden" name="status" value={status} />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
                      disabled={loading || checkingConnection}
                    >
                      {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                    
                    <div className="text-center">
                      <span className="text-pharmacy-green2 text-xs">Já possui uma conta? </span>
                      <Link to="/" className="text-pharmacy-accent hover:underline text-xs">
                        Fazer login
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
              <h1 className="text-5xl font-bold text-white mb-6">Cadastro</h1>
              <p className="text-xl text-pharmacy-green2 mb-10 leading-relaxed">
                Crie sua conta para gerenciar seus clientes e impulsionar suas vendas.
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

          {/* Lado direito - Formulário de cadastro */}
          <div className="w-1/2 bg-pharmacy-dark2 p-12 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-pharmacy-dark1 rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-2">Criar conta</h2>
                <p className="text-base text-pharmacy-green2 mb-6">Preencha os campos abaixo para se cadastrar</p>
                
                {isOffline && (
                  <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-200">
                    Você está no modo offline. Seus dados serão salvos localmente.
                    <Button 
                      onClick={handleCheckConnection} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      disabled={checkingConnection}
                    >
                      {checkingConnection ? 
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : 
                        <RefreshCw className="h-4 w-4 mr-2" />
                      }
                      Verificar conexão
                    </Button>
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-200">
                    Conta criada com sucesso! Redirecionando...
                  </div>
                )}
                
                <form onSubmit={handleRegister}>
                  <div className="space-y-5">
                    {/* Nome */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white" htmlFor="desktop-name">
                        Nome
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="desktop-name"
                          type="text"
                          placeholder="Seu nome completo"
                          className="pl-10 bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark2"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white" htmlFor="desktop-email">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="desktop-email"
                          type="email"
                          placeholder="Seu email"
                          className="pl-10 bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark2"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="username"
                        />
                      </div>
                    </div>
                    
                    {/* Senha */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white" htmlFor="desktop-password">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pharmacy-green2" />
                        <Input
                          id="desktop-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Crie uma senha"
                          className="pl-10 pr-10 bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark2"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
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
                    
                    {/* Função */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white" htmlFor="desktop-role">
                        Função
                      </label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark2">
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                        <SelectContent className="bg-pharmacy-dark2 border-pharmacy-dark2 text-white">
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="agent">Atendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Status (oculto, definido como ativo por padrão) */}
                    <input type="hidden" name="status" value={status} />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white text-base py-6"
                      disabled={loading || checkingConnection}
                    >
                      {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                    
                    <div className="text-center pt-2">
                      <span className="text-pharmacy-green2">Já possui uma conta? </span>
                      <Link to="/" className="text-pharmacy-accent hover:underline">
                        Fazer login
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

export default Register; 