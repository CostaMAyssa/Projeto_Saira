
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
// Switch might not be needed anymore if 2FA was the only user, but keeping for now.
// import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/contexts/SupabaseContext'; // Import useSupabase
import { toast } from '@/components/ui/use-toast'; // Import toast

const SecurityTab = () => {
  const { supabase } = useSupabase(); // Get Supabase client

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State for current session display
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordError(''); // Clear error on input change
    if (id === 'current-password') setCurrentPassword(value);
    else if (id === 'new-password') setNewPassword(value);
    else if (id === 'confirm-password') setConfirmNewPassword(value);
  };

  const handleChangePassword = async () => {
    console.log('SecurityTab: Attempting password change...');
    if (!supabase) {
      console.error('SecurityTab: Supabase client is not available at the start of handleChangePassword.');
      setPasswordError('Erro crítico: Cliente Supabase não disponível.');
      setPasswordLoading(false);
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Todos os campos de senha são obrigatórios.');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('As novas senhas não coincidem.');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      setPasswordLoading(false);
      return;
    }

    // This check is now at the top of the function.
    // if (!supabase) {
    //   setPasswordError('Erro de conexão. Tente novamente.');
    //   setPasswordLoading(false);
    //   return;
    // }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        console.error('SecurityTab: User or email not found before password verification.');
        setPasswordError('Usuário não encontrado ou e-mail ausente.');
        setPasswordLoading(false);
        return;
      }
      const email = user.email;

      console.log('SecurityTab: Verifying current password for user:', email);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        console.error('SecurityTab: Error during signInWithPassword for verification:', signInError);
        setPasswordError('A senha atual está incorreta.');
        setPasswordLoading(false);
        return;
      }

      console.log('SecurityTab: Attempting to update user password.');
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('SecurityTab: Error during updateUser for password change:', updateError);
        setPasswordError(`Erro ao atualizar senha: ${updateError.message}`);
        setPasswordLoading(false);
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Sua senha foi atualizada com sucesso.",
        variant: "default",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

    } catch (error: any) {
      // General catch block, specific errors logged above.
      console.error('SecurityTab: Unexpected error in handleChangePassword:', error);
      setPasswordError(error.message || 'Ocorreu um erro inesperado ao alterar a senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const fetchCurrentSession = async () => {
    console.log('SecurityTab: Attempting to fetch current session...');
    if (!supabase) {
      console.error('SecurityTab: Supabase client is not available at the start of fetchCurrentSession.');
      setSessionError('Erro crítico: Cliente Supabase não disponível.');
      setSessionLoading(false);
      return;
    }

    setSessionLoading(true);
    setSessionError('');

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('SecurityTab: Error during supabase.auth.getSession():', error);
        setSessionError(error.message);
      } else if (data && data.session) {
        console.log('SecurityTab: Successfully fetched session:', data.session);
        setCurrentSession(data.session);
      } else {
        console.log('SecurityTab: No active session found.');
        setSessionError('Nenhuma sessão ativa encontrada.');
        setCurrentSession(null);
      }
    } catch (e: any) {
      console.error('SecurityTab: Unexpected error in fetchCurrentSession:', e);
      setSessionError(e.message || 'Falha ao buscar sessão.');
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSession();
  }, [supabase]); // Added supabase to dependency array in case it can change

  const handleSignOutCurrentSession = async () => {
    console.log('SecurityTab: Attempting to sign out current session...');
    if (!supabase) {
      console.error('SecurityTab: Supabase client is not available at the start of handleSignOutCurrentSession.');
      toast.error('Erro crítico: Cliente Supabase não disponível.');
      return;
    }

    const confirmed = window.confirm("Tem certeza que deseja encerrar a sessão atual neste dispositivo?");
    if (!confirmed) {
      return;
    }

    setSessionLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SecurityTab: Error during supabase.auth.signOut():', error);
        toast.error(`Erro ao encerrar a sessão: ${error.message}`);
      } else {
        console.log('SecurityTab: Successfully signed out.');
        toast.success('Sessão encerrada com sucesso.');
        setCurrentSession(null);
      }
    } catch (e: any) {
      console.error('SecurityTab: Unexpected error in handleSignOutCurrentSession:', e);
      toast.error(`Erro inesperado ao encerrar sessão: ${e.message}`);
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Segurança da Conta</CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Gerencie as configurações de segurança da sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-6">
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Alterar Senha</h3>
          
          <div className="space-y-3">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="current-password" className="text-pharmacy-text1">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                className="bg-white border-gray-300 text-pharmacy-text1"
                value={currentPassword}
                onChange={handlePasswordInputChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="new-password" className="text-pharmacy-text1">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                className="bg-white border-gray-300 text-pharmacy-text1"
                value={newPassword}
                onChange={handlePasswordInputChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirm-password" className="text-pharmacy-text1">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                className="bg-white border-gray-300 text-pharmacy-text1"
                value={confirmNewPassword}
                onChange={handlePasswordInputChange}
              />
            </div>
          </div>
          
          {passwordError && <p className="text-sm text-red-500 pt-1">{passwordError}</p>}

          <Button
            onClick={() => {
              console.log('SecurityTab: "Atualizar Senha" button clicked.'); // ADD THIS LINE
              handleChangePassword();
            }}
            disabled={passwordLoading}
            className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
          </Button>
        </div>
        
        {/* Verificação em Duas Etapas section removed */}
        
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Sessões Ativas</h3>
          
          {sessionLoading && <p className="text-sm text-gray-500">Carregando informações da sessão...</p>}
          {sessionError && <p className="text-sm text-red-500">{sessionError}</p>}

          {currentSession && (
            <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Este dispositivo (Sessão Atual)</div>
                <div className="text-xs md:text-sm text-pharmacy-text2">
                  Último login: {currentSession.user?.last_sign_in_at ? new Date(currentSession.user.last_sign_in_at).toLocaleString('pt-BR') : 'Não disponível'}
                </div>
                {/* <div className="text-xs md:text-sm text-pharmacy-text2">Expira em: {new Date(currentSession.expires_at * 1000).toLocaleString('pt-BR')}</div> */}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2"
                onClick={handleSignOutCurrentSession}
                disabled={sessionLoading} // Disable button while any session operation is in progress
              >
                {sessionLoading ? 'Encerrando...' : 'Encerrar Sessão Atual'}
              </Button>
            </div>
          )}
          
          {!sessionLoading && (
            <p className="text-xs text-gray-400 mt-2">
              A listagem e gerenciamento de outras sessões ativas não está disponível diretamente no navegador por motivos de segurança.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityTab;
