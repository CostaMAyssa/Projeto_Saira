import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Bell, Plus, Users, CalendarClock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (campaignData: {
    name: string;
    type: string;
    audience: string;
    schedule: string;
    status: 'active' | 'paused' | 'scheduled';
    lastRun: string;
  }) => void;
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [audienceCount, setAudienceCount] = useState('15');
  const [scheduleType, setScheduleType] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [isActive, setIsActive] = useState(true);
  const [messageTemplate, setMessageTemplate] = useState('');
  
  // Predefined campaign types and their descriptions
  const campaignTypes = {
    recompra: {
      name: 'Lembrete de Recompra',
      description: 'Notificar clientes sobre a necessidade de recompra de medicamentos de uso contínuo.',
      template: 'Olá {nome}, notamos que seu medicamento {medicamento} está próximo de acabar. Temos disponível para retirada na farmácia. Podemos separar para você?'
    },
    aniversario: {
      name: 'Aniversário',
      description: 'Mensagem de felicitação pelo aniversário com oferta especial.',
      template: 'Olá {nome}, a equipe da Farmácia Saíra deseja um Feliz Aniversário! Como presente, você tem 10% de desconto em qualquer produto hoje!'
    },
    posvenda: {
      name: 'Pós-venda',
      description: 'Acompanhamento após a venda de produtos específicos.',
      template: 'Olá {nome}, como foi a experiência com {produto} que adquiriu conosco? Estamos à disposição para qualquer dúvida ou orientação adicional.'
    },
    reativacao: {
      name: 'Reativação',
      description: 'Campanha para reconectar com clientes inativos.',
      template: 'Olá {nome}, sentimos sua falta! Faz algum tempo que não nos visita e preparamos ofertas especiais para você. Venha conferir!'
    },
    promocao: {
      name: 'Promoção',
      description: 'Divulgação de ofertas e promoções para clientes específicos.',
      template: 'Olá {nome}, temos uma oferta especial para você! {produto} com até 20% de desconto até o fim de semana. Aproveite!'
    }
  };

  const handleTypeChange = (value: string) => {
    setCampaignType(value);
    if (value in campaignTypes) {
      setCampaignName(campaignTypes[value as keyof typeof campaignTypes].name);
      setMessageTemplate(campaignTypes[value as keyof typeof campaignTypes].template);
    }
  };

  const getFormattedSchedule = () => {
    if (scheduleType === 'once') {
      const formattedDate = scheduleDate ? format(scheduleDate, 'dd/MM/yyyy', { locale: ptBR }) : '';
      return `Agendado para ${formattedDate}, ${scheduleTime}`;
    } else {
      return `Diário, ${scheduleTime}`;
    }
  };

  const handleSubmit = () => {
    if (!campaignName.trim() || !campaignType) {
      return;
    }

    const schedule = getFormattedSchedule();
    let status: 'active' | 'paused' | 'scheduled' = 'scheduled';
    
    if (scheduleType === 'once' && scheduleDate && scheduleDate > new Date()) {
      status = 'scheduled';
    } else if (isActive) {
      status = 'active';
    } else {
      status = 'paused';
    }

    onSubmit({
      name: campaignName,
      type: campaignTypes[campaignType as keyof typeof campaignTypes]?.name || campaignType,
      audience: `${audienceCount} clientes`,
      schedule,
      status,
      lastRun: status === 'scheduled' ? 'Nunca executado' : 'Agora'
    });

    // Reset form
    setCampaignName('');
    setCampaignType('');
    setAudienceCount('15');
    setScheduleType('daily');
    setScheduleTime('09:00');
    setScheduleDate(new Date());
    setIsActive(true);
    setMessageTemplate('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-pharmacy-text1 flex items-center gap-2">
            <Bell className="h-5 w-5 text-pharmacy-accent" />
            Nova Campanha
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaignType" className="text-pharmacy-text1">Tipo de Campanha</Label>
            <Select value={campaignType} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-white border-pharmacy-border1">
                <SelectValue placeholder="Selecione um tipo de campanha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recompra">Lembrete de Recompra</SelectItem>
                <SelectItem value="aniversario">Aniversário</SelectItem>
                <SelectItem value="posvenda">Pós-venda</SelectItem>
                <SelectItem value="reativacao">Reativação</SelectItem>
                <SelectItem value="promocao">Promoção</SelectItem>
              </SelectContent>
            </Select>
            {campaignType && (
              <p className="text-xs text-pharmacy-text2 mt-1">
                {campaignTypes[campaignType as keyof typeof campaignTypes]?.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaignName" className="text-pharmacy-text1">Nome da Campanha</Label>
            <Input
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Ex: Lembrete de Medicamentos de Uso Contínuo"
              className="bg-white border-pharmacy-border1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audienceCount" className="text-pharmacy-text1">Audiência (clientes)</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-pharmacy-text2" />
                <Input
                  id="audienceCount"
                  type="number"
                  min="1"
                  value={audienceCount}
                  onChange={(e) => setAudienceCount(e.target.value)}
                  className="bg-white border-pharmacy-border1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleType" className="text-pharmacy-text1">Tipo de Agendamento</Label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger className="bg-white border-pharmacy-border1">
                  <SelectValue placeholder="Selecione o agendamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="once">Uma vez</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {scheduleType === 'once' && (
              <div className="space-y-2">
                <Label className="text-pharmacy-text1">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-pharmacy-border1 text-pharmacy-text1"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="scheduleTime" className="text-pharmacy-text1">Hora</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-pharmacy-text2" />
                <Input
                  id="scheduleTime"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-white border-pharmacy-border1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageTemplate" className="text-pharmacy-text1">Modelo de Mensagem</Label>
            <Textarea
              id="messageTemplate"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Digite a mensagem que será enviada..."
              className="bg-white border-pharmacy-border1 min-h-[100px]"
            />
            <p className="text-xs text-pharmacy-text2">
              Use {'{nome}'}, {'{produto}'}, {'{medicamento}'} para personalizar a mensagem.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive" className="text-pharmacy-text1">Ativar Campanha</Label>
              <p className="text-xs text-pharmacy-text2">
                {scheduleType === 'once' ? 'Ativar para envio na data agendada' : 'Iniciar envio diário imediatamente'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-pharmacy-border1 text-pharmacy-text1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!campaignName.trim() || !campaignType}
            className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Campanha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal; 