import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import CampaignTypeSelector from './campaign-form/CampaignTypeSelector';
import CampaignNameField from './campaign-form/CampaignNameField';
import AudienceSelector from './campaign-form/AudienceSelector';
import CampaignTagsSelector from './campaign-form/CampaignTagsSelector';
import ScheduleSelector from './campaign-form/ScheduleSelector';
import MessageTemplateField from './campaign-form/MessageTemplateField';
import CampaignActivationToggle from './campaign-form/CampaignActivationToggle';
import { campaignTypes } from './campaign-form/campaignTypes';

interface TagOption {
  value: string;
  label: string;
  color: string;
}

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
    tags: TagOption[];
  }) => void;
}

const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [audienceCount, setAudienceCount] = useState('15');
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [scheduleType, setScheduleType] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [isActive, setIsActive] = useState(true);
  const [messageTemplate, setMessageTemplate] = useState('');

  const handleTypeChange = (value: string) => {
    setCampaignType(value);
    if (value in campaignTypes) {
      setCampaignName(campaignTypes[value].name);
      setMessageTemplate(campaignTypes[value].template);
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
      type: campaignTypes[campaignType]?.name || campaignType,
      audience: `${audienceCount} clientes`,
      schedule,
      status,
      lastRun: status === 'scheduled' ? 'Nunca executado' : 'Agora',
      tags: selectedTags
    });

    // Reset form
    setCampaignName('');
    setCampaignType('');
    setAudienceCount('15');
    setSelectedTags([]);
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
          <CampaignTypeSelector 
            campaignType={campaignType} 
            onTypeChange={handleTypeChange} 
            campaignTypes={campaignTypes} 
          />

          <CampaignNameField 
            campaignName={campaignName} 
            onChange={(e) => setCampaignName(e.target.value)} 
          />

          <div className="grid grid-cols-2 gap-4">
            <AudienceSelector 
              audienceCount={audienceCount} 
              onChange={(e) => setAudienceCount(e.target.value)} 
            />
          
            <div className="space-y-2">
              <ScheduleSelector 
                scheduleType={scheduleType}
                setScheduleType={setScheduleType}
                scheduleDate={scheduleDate}
                setScheduleDate={setScheduleDate}
                scheduleTime={scheduleTime}
                setScheduleTime={setScheduleTime}
              />
            </div>
          </div>

          <CampaignTagsSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />

          <MessageTemplateField 
            messageTemplate={messageTemplate} 
            onChange={(e) => setMessageTemplate(e.target.value)} 
          />

          <CampaignActivationToggle 
            isActive={isActive} 
            onCheckedChange={setIsActive} 
            scheduleType={scheduleType} 
          />
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
