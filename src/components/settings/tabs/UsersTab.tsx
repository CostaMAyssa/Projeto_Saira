
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UsersTab = () => {
  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Usuários e Permissões</CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Gerencie usuários e suas permissões no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
            <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Usuários do Sistema</h3>
            <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white text-xs md:text-sm" size="sm">
              Adicionar Usuário
            </Button>
          </div>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-pharmacy-accent flex items-center justify-center text-white text-xs md:text-sm font-medium">
                MF
              </div>
              <div>
                <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Maria Farmacêutica</div>
                <div className="text-xs md:text-sm text-pharmacy-text2">Administrador • maria@farmacia.com</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
              Editar
            </Button>
          </div>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-pharmacy-accent flex items-center justify-center text-white text-xs md:text-sm font-medium">
                JS
              </div>
              <div>
                <div className="text-sm md:text-base text-pharmacy-text1 font-medium">João Silva</div>
                <div className="text-xs md:text-sm text-pharmacy-text2">Atendente • joao@farmacia.com</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
              Editar
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Perfis de Acesso</h3>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
            <div>
              <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Administrador</div>
              <div className="text-xs md:text-sm text-pharmacy-text2">Acesso completo ao sistema</div>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
              Configurar
            </Button>
          </div>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
            <div>
              <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Atendente</div>
              <div className="text-xs md:text-sm text-pharmacy-text2">Acesso limitado a chat e clientes</div>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
              Configurar
            </Button>
          </div>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
            <div>
              <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Gerente</div>
              <div className="text-xs md:text-sm text-pharmacy-text2">Acesso a relatórios e configurações</div>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
              Configurar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersTab;
