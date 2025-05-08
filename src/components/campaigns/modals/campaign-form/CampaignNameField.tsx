
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CampaignNameFieldProps {
  campaignName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CampaignNameField: React.FC<CampaignNameFieldProps> = ({ 
  campaignName, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="campaignName" className="text-pharmacy-text1">Nome da Campanha</Label>
      <Input
        id="campaignName"
        value={campaignName}
        onChange={onChange}
        placeholder="Ex: Lembrete de Medicamentos de Uso Contínuo"
        className="bg-white border-pharmacy-border1"
      />
    </div>
  );
};

export default CampaignNameField;
