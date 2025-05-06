import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoImage from '@/lib/assets/Logo.png';

const TopBar = () => {
  return (
    <div className="h-16 bg-pharmacy-dark2 border-b border-pharmacy-dark1 flex items-center justify-between px-4">
      <div className="flex-1 flex items-center gap-2">
        <img 
          src={LogoImage}
          alt="Logo Sairá"
          className="w-8 h-8 rounded-full object-cover"
        />
        <h1 className="text-xl font-medium text-white">Sairá</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-2">
          <span className="text-white text-sm font-medium">Bem Vindo, Mayssa</span>
          <span className="text-xs text-gray-400">mayssa1@outlook.com</span>
        </div>
        
        <Button 
          size="sm" 
          className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white text-xs"
        >
          Sair
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
