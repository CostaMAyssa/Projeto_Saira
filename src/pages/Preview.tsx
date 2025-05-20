import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Index from './Index';

/**
 * Componente de visualização do sistema sem necessidade de login
 */
const Preview = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Banner de modo de visualização */}
      <div className="bg-yellow-500 text-black p-2 text-center z-50">
        <p className="font-bold">Modo de Visualização - Acesso Limitado</p>
        <p className="text-sm mb-2">Esta é uma versão de demonstração com funcionalidades restritas</p>
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-black text-white hover:bg-gray-800">
            Fazer Login para Acesso Completo
          </Button>
        </Link>
      </div>
      
      {/* Renderizar o mesmo componente usado na rota protegida */}
      <div className="flex-1 overflow-hidden">
        <Index />
      </div>
    </div>
  );
};

export default Preview; 