
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const SecurityTab = () => {
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
              <Input id="current-password" type="password" className="bg-white border-gray-300 text-pharmacy-text1" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="new-password" className="text-pharmacy-text1">Nova Senha</Label>
              <Input id="new-password" type="password" className="bg-white border-gray-300 text-pharmacy-text1" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirm-password" className="text-pharmacy-text1">Confirmar Nova Senha</Label>
              <Input id="confirm-password" type="password" className="bg-white border-gray-300 text-pharmacy-text1" />
            </div>
          </div>
          
          <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
            Atualizar Senha
          </Button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Verificação em Duas Etapas</h3>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            <div>
              <Label className="text-sm md:text-base text-pharmacy-text1">Ativar Verificação em Duas Etapas</Label>
              <p className="text-xs md:text-sm text-pharmacy-text2">Aumenta a segurança da sua conta</p>
            </div>
            <Switch id="two-factor" defaultChecked={true} />
          </div>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg">
            <div className="text-sm md:text-base text-pharmacy-text1 font-medium mb-1">Método de verificação</div>
            <div className="text-xs md:text-sm text-pharmacy-text2">SMS para +55 11 98765-4321</div>
            <Button variant="link" className="p-0 text-xs md:text-sm text-pharmacy-accent">Alterar método</Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Sessões Ativas</h3>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            <div>
              <div className="text-sm md:text-base text-pharmacy-text1 font-medium">Este dispositivo</div>
              <div className="text-xs md:text-sm text-pharmacy-text2">Última atividade: Agora</div>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
              Encerrar
            </Button>
          </div>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            <div>
              <div className="text-sm md:text-base text-pharmacy-text1 font-medium">MacBook Pro</div>
              <div className="text-xs md:text-sm text-pharmacy-text2">Última atividade: 2 horas atrás</div>
            </div>
            <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
              Encerrar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityTab;
