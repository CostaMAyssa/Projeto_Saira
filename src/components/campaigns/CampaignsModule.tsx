
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Bell, Plus, Play, Pause, Calendar } from 'lucide-react';

const CampaignsModule = () => {
  const mockCampaigns = [
    {
      id: '1',
      name: 'Lembrete de Recompra - Hipertensão',
      type: 'Lembrete de Recompra',
      audience: '42 clientes',
      status: 'active',
      schedule: 'Diário, 09:00',
      lastRun: '2 horas atrás',
    },
    {
      id: '2',
      name: 'Aniversariantes do Mês',
      type: 'Aniversário',
      audience: '15 clientes',
      status: 'active',
      schedule: 'Diário, 10:00',
      lastRun: '1 hora atrás',
    },
    {
      id: '3',
      name: 'Lembrete de Recompra - Diabetes',
      type: 'Lembrete de Recompra',
      audience: '28 clientes',
      status: 'paused',
      schedule: 'Diário, 09:30',
      lastRun: '2 dias atrás',
    },
    {
      id: '4',
      name: 'Pós-venda - Antibióticos',
      type: 'Pós-venda',
      audience: '5 clientes',
      status: 'active',
      schedule: 'Diário, 14:00',
      lastRun: '5 horas atrás',
    },
    {
      id: '5',
      name: 'Reativação de Clientes Inativos',
      type: 'Reativação',
      audience: '38 clientes',
      status: 'scheduled',
      schedule: 'Agendado para 15/05/2023',
      lastRun: 'Nunca executado',
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Campanhas e Automações</h1>
        <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
        </div>
        <Button variant="outline" className="text-pharmacy-green2 border-pharmacy-green1">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      <div className="bg-pharmacy-dark2 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-dark1 text-pharmacy-green2 font-medium">
          <div className="col-span-4">Nome</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2">Audiência</div>
          <div className="col-span-2">Agendamento</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Ações</div>
        </div>
        
        {mockCampaigns.map((campaign) => (
          <div 
            key={campaign.id} 
            className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-dark1 hover:bg-pharmacy-dark1 cursor-pointer"
          >
            <div className="col-span-4">
              <div className="text-white font-medium">{campaign.name}</div>
              <div className="text-xs text-muted-foreground">Última execução: {campaign.lastRun}</div>
            </div>
            <div className="col-span-2 text-muted-foreground flex items-center">
              {campaign.type === 'Lembrete de Recompra' ? <Bell className="h-4 w-4 mr-1 text-pharmacy-green2" /> : 
               campaign.type === 'Aniversário' ? <Calendar className="h-4 w-4 mr-1 text-pharmacy-green2" /> : 
               campaign.type === 'Pós-venda' ? <Bell className="h-4 w-4 mr-1 text-pharmacy-green2" /> : 
               <Bell className="h-4 w-4 mr-1 text-pharmacy-green2" />}
              {campaign.type}
            </div>
            <div className="col-span-2 text-muted-foreground">{campaign.audience}</div>
            <div className="col-span-2 text-muted-foreground">{campaign.schedule}</div>
            <div className="col-span-1">
              <Badge 
                className={campaign.status === 'active' ? "bg-green-600" : 
                           campaign.status === 'paused' ? "bg-yellow-600" : 
                           "bg-blue-600"}
              >
                {campaign.status === 'active' ? 'Ativa' : 
                 campaign.status === 'paused' ? 'Pausada' : 
                 'Agendada'}
              </Badge>
            </div>
            <div className="col-span-1 flex justify-center">
              {campaign.status === 'active' ? (
                <Button variant="ghost" size="icon" className="text-pharmacy-green2 hover:text-pharmacy-accent">
                  <Pause className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="text-pharmacy-green2 hover:text-pharmacy-accent">
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Exibindo 5 de 12 campanhas
      </div>
    </div>
  );
};

export default CampaignsModule;
