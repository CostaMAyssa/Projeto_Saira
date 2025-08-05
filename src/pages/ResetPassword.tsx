import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Link inválido ou expirado');
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error('Erro ao atualizar senha');
        console.error('Erro:', error);
      } else {
        setSuccess(true);
        toast.success('Senha atualizada com sucesso!');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/sistema');
        }, 2000);
      }
    } catch (error) {
      toast.error('Erro inesperado');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-pharmacy-dark1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-pharmacy-dark2 border-pharmacy-dark2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-pharmacy-accent/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-pharmacy-accent" />
            </div>
            <CardTitle className="text-xl text-white">Senha Atualizada!</CardTitle>
            <CardDescription className="text-pharmacy-green2">
              Sua senha foi alterada com sucesso. Você será redirecionado em instantes...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert className="bg-yellow-500/20 border-yellow-500 text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Redirecionando automaticamente para o sistema...
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/sistema')} 
              className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
            >
              Ir para o sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pharmacy-dark1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-pharmacy-dark2 border-pharmacy-dark2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-pharmacy-accent/20 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-pharmacy-accent" />
          </div>
          <CardTitle className="text-xl text-white">Nova Senha</CardTitle>
          <CardDescription className="text-pharmacy-green2">
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-pharmacy-green2" /> : <Eye className="w-4 h-4 text-pharmacy-green2" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-pharmacy-green2" /> : <Eye className="w-4 h-4 text-pharmacy-green2" />}
                </button>
              </div>
            </div>

            <Alert className="bg-blue-500/20 border-blue-500 text-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A senha deve ter pelo menos 6 caracteres.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>

            <div className="text-center">
              <Link 
                to="/" 
                className="text-sm text-pharmacy-accent hover:text-pharmacy-accent/80 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword; 