import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, insira seu email');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://saira.insignemarketing.com.br/redefinir-senha'
      });

      if (error) {
        toast.error('Erro ao enviar email de recuperação');
        console.error('Erro:', error);
      } else {
        setSent(true);
        toast.success('Email de recuperação enviado!');
      }
    } catch (error) {
      toast.error('Erro inesperado');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-pharmacy-dark1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-pharmacy-dark2 border-pharmacy-dark2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-pharmacy-accent/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-pharmacy-accent" />
            </div>
            <CardTitle className="text-xl text-white">Email Enviado!</CardTitle>
            <CardDescription className="text-pharmacy-green2">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-500/20 border-yellow-500 text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Se não receber o email em alguns minutos, verifique sua pasta de spam.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full border-pharmacy-accent text-pharmacy-accent hover:bg-pharmacy-accent hover:text-white"
              onClick={() => setSent(false)}
            >
              Enviar novamente
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
            <Mail className="w-6 h-6 text-pharmacy-accent" />
          </div>
          <CardTitle className="text-xl text-white">Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-pharmacy-green2">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-pharmacy-dark1 border-pharmacy-dark1 text-white focus:border-pharmacy-accent focus:bg-pharmacy-dark1"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar email de recuperação'}
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

export default ForgotPassword; 