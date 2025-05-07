import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import LogoImage from '@/lib/assets/Logo.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Em um ambiente real, aqui você faria uma chamada à API de autenticação
    // Por enquanto, vamos apenas redirecionar para o dashboard
    navigate('/dashboard');
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
                      <a href="#" className="text-pharmacy-accent hover:underline text-xs">
                        Esqueceu sua senha?
                      </a>
                    </div>
                    
                    <Button type="submit" className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
                      Entrar
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
                      <a href="#" className="text-pharmacy-accent hover:underline text-xs">
                        Criar conta
                      </a>
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
                      <a href="#" className="text-pharmacy-accent hover:underline text-sm">
                        Esqueceu sua senha?
                      </a>
                    </div>
                    
                    <Button type="submit" className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
                      Entrar
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
                      <a href="#" className="text-pharmacy-accent hover:underline text-sm">
                        Criar conta
                      </a>
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