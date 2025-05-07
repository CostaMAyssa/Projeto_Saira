import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Em uma aplicação real, aqui você limparia tokens de autenticação, cookies, etc.
    // Por exemplo: localStorage.removeItem('authToken');
    
    // Redireciona para a página de login
    navigate('/');
  };

  return (
    <div className="h-16 bg-white border-b border-pharmacy-border1 flex items-center justify-end px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-2">
          <span className="text-pharmacy-text1 text-sm font-medium">Bem Vindo, Mayssa</span>
          <span className="text-xs text-pharmacy-text2">mayssa1@outlook.com</span>
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
