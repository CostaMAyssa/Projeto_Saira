
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CampaignType {
  name: string;
  description: string;
  template: string;
}

interface CampaignTypeSelectorProps {
  campaignType: string;
  onTypeChange: (value: string) => void;
  campaignTypes: Record<string, CampaignType>;
}

const CampaignTypeSelector: React.FC<CampaignTypeSelectorProps> = ({ 
  campaignType, 
  onTypeChange, 
  campaignTypes 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="campaignType" className="text-pharmacy-text1">Tipo de Campanha</Label>
      <Select value={campaignType} onValueChange={onTypeChange}>
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
          {campaignTypes[campaignType]?.description}
        </p>
      )}
    </div>
  );
};

export default CampaignTypeSelector;
