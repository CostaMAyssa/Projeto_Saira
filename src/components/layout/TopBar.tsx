import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/components/ui/use-toast';

const TopBar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useSupabase();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      // Redireciona para a página de login
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-16 bg-white border-b border-pharmacy-border1 flex items-center justify-end px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-2">
          <span className="text-pharmacy-text1 text-sm font-medium">
            Bem Vindo, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
          </span>
          <span className="text-xs text-pharmacy-text2">{user?.email}</span>
        </div>
        
        <Button 
          size="sm" 
          className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white text-xs"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
