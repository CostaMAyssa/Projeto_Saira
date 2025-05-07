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
    <div className="h-16 bg-pharmacy-dark1 border-b border-pharmacy-dark2 flex items-center justify-end px-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-2">
          <span className="text-white text-sm font-medium">Bem Vindo, Mayssa</span>
          <span className="text-xs text-gray-400">mayssa1@outlook.com</span>
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
