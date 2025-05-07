import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import LogoImage from '@/lib/assets/Logo.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
    <div className="min-h-screen flex bg-pharmacy-dark1">
      {/* Lado esquerdo - Mensagem de boas-vindas */}
      <div className="w-1/2 p-12 flex flex-col justify-center items-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-white mb-6">Bem-vindo!</h1>
          <p className="text-xl text-pharmacy-green2 mb-10 leading-relaxed">
            Acesse sua conta para gerenciar seus clientes e impulsionar suas vendas.
          </p>
          
          <div className="flex flex-col items-center mt-20">
            <div className="w-36 h-36 mb-6">
              <img 
                src={LogoImage} 
                alt="Logo Sairá" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-semibold text-white logo-text">
              <span className="text-pharmacy-accent">Sai</span>
              <span className="text-pharmacy-green2">rá</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-1/2 bg-pharmacy-dark2 p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-pharmacy-dark1 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-2">Entrar</h2>
            <p className="text-pharmacy-green2 mb-6">Informe seus dados para acessar sua conta</p>
            
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
                      className="pl-10 bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      className="pl-10 pr-10 bg-pharmacy-dark2 border-pharmacy-dark2 text-white focus:border-pharmacy-accent"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
  );
};

export default Login; 