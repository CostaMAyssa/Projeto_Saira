
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const NotificationsTab = () => {
  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Preferências de Notificação</CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Gerencie como e quando receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-6">
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Notificações do Sistema</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Novas mensagens</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Notificar quando receber novas mensagens</p>
              </div>
              <Switch id="new-messages" defaultChecked={true} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Campanhas</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Notificar sobre status de campanhas</p>
              </div>
              <Switch id="campaigns-notifications" defaultChecked={true} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Lembretes</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Notificar sobre lembretes programados</p>
              </div>
              <Switch id="reminders-notifications" defaultChecked={true} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Respostas de formulários</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Notificar sobre novas respostas em formulários</p>
              </div>
              <Switch id="forms-notifications" defaultChecked={false} />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base md:text-lg font-medium text-pharmacy-text1">Canais de Notificação</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Email</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Receber notificações por email</p>
              </div>
              <Switch id="email-notifications" defaultChecked={true} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">Push (navegador)</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Receber notificações push no navegador</p>
              </div>
              <Switch id="push-notifications" defaultChecked={true} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div>
                <Label className="text-sm md:text-base text-pharmacy-text1">SMS</Label>
                <p className="text-xs md:text-sm text-pharmacy-text2">Receber notificações importantes por SMS</p>
              </div>
              <Switch id="sms-notifications" defaultChecked={false} />
            </div>
          </div>
        </div>
        
        <Button className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white">
          Salvar Preferências
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
