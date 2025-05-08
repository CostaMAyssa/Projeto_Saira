
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CampaignActivationToggleProps {
  isActive: boolean;
  onCheckedChange: (checked: boolean) => void;
  scheduleType: string;
}

const CampaignActivationToggle: React.FC<CampaignActivationToggleProps> = ({ 
  isActive, 
  onCheckedChange, 
  scheduleType 
}) => {
  return (
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
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
};

export default CampaignActivationToggle;
