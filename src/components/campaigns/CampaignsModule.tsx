import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, Plus, Play, Pause, Calendar, Clock, BarChart, RefreshCcw } from 'lucide-react';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Lembrete de Recompra':
        return <Bell className="h-4 w-4 mr-1 text-pharmacy-accent" />;
      case 'Aniversário':
        return <Calendar className="h-4 w-4 mr-1 text-pharmacy-accent" />;
      case 'Pós-venda':
        return <BarChart className="h-4 w-4 mr-1 text-pharmacy-accent" />;
      case 'Reativação':
        return <RefreshCcw className="h-4 w-4 mr-1 text-pharmacy-accent" />;
      default:
        return <Clock className="h-4 w-4 mr-1 text-pharmacy-accent" />;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-pharmacy-text1">Campanhas e Automações</h1>
        <Button className="bg-pharmacy-accent hover:bg-pharmacy-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar campanhas..."
            className="pl-8 bg-white border-gray-300 text-pharmacy-text1 focus:border-pharmacy-accent w-full"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-xl overflow-hidden border border-pharmacy-border1 shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-border1 text-pharmacy-text1 font-medium bg-pharmacy-light2">
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
            className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-border1 hover:bg-pharmacy-light2 cursor-pointer"
          >
            <div className="col-span-4">
              <div className="text-pharmacy-text1 font-medium">{campaign.name}</div>
              <div className="text-xs text-pharmacy-text2">Última execução: {campaign.lastRun}</div>
            </div>
            <div className="col-span-2 text-pharmacy-text2 flex items-center">
              {getTypeIcon(campaign.type)}
              {campaign.type}
            </div>
            <div className="col-span-2 text-pharmacy-text2">{campaign.audience}</div>
            <div className="col-span-2 text-pharmacy-text2">{campaign.schedule}</div>
            <div className="col-span-1">
              {campaign.status === 'active' ? (
                <Badge className="bg-green-100 text-green-700 border border-green-200 font-medium">
                  Ativa
                </Badge>
              ) : campaign.status === 'paused' ? (
                <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">
                  Pausada
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                  Agendada
                </Badge>
              )}
            </div>
            <div className="col-span-1 flex justify-center">
              {campaign.status === 'active' ? (
                <Button variant="ghost" size="icon" className="text-pharmacy-text2 hover:text-pharmacy-accent">
                  <Pause className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="text-pharmacy-text2 hover:text-pharmacy-accent">
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-pharmacy-text2">
        Exibindo 5 de 12 campanhas
      </div>
    </div>
  );
};

export default CampaignsModule;
