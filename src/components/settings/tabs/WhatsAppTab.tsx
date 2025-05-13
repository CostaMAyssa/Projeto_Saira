
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const WhatsAppTab = () => {
  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Configurações do WhatsApp</CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Gerencie suas conexões com o WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-6">
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Números Conectados</h3>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <div className="text-sm md:text-base text-pharmacy-text1 font-medium">+55 11 98765-4321</div>
              <div className="text-xs md:text-sm text-pharmacy-accent">Principal • Conectado</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch id="primary-active" defaultChecked={true} />
                <Label htmlFor="primary-active" className="text-sm text-pharmacy-text1">Ativo</Label>
              </div>
              <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                Configurar
              </Button>
            </div>
          </div>
          
          <div className="bg-pharmacy-light2 p-3 md:p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div>
              <div className="text-sm md:text-base text-pharmacy-text1 font-medium">+55 11 91234-5678</div>
              <div className="text-xs md:text-sm text-pharmacy-accent">Secundário • Conectado</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch id="secondary-active" defaultChecked={false} />
                <Label htmlFor="secondary-active" className="text-sm text-pharmacy-text1">Ativo</Label>
              </div>
              <Button variant="outline" size="sm" className="text-xs md:text-sm text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2">
                Configurar
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Configurações de Mensagens</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Respostas automáticas</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Ativar respostas automáticas quando offline</p>
              </div>
              <Switch id="auto-reply" defaultChecked={true} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Notificações de leitura</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Enviar confirmações de leitura</p>
              </div>
              <Switch id="read-receipts" defaultChecked={true} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Mensagens de boas-vindas</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Enviar mensagem automática para novos contatos</p>
              </div>
              <Switch id="welcome-message" defaultChecked={true} />
            </div>
          </div>
        </div>
        
        <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
          <MessageSquare className="mr-2 h-4 w-4" />
          Adicionar Novo Número
        </Button>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTab;
