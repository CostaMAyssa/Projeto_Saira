
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';

interface AudienceSelectorProps {
  audienceCount: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AudienceSelector: React.FC<AudienceSelectorProps> = ({ 
  audienceCount, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="audienceCount" className="text-pharmacy-text1">Audiência (clientes)</Label>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-pharmacy-text2" />
        <Input
          id="audienceCount"
          type="number"
          min="1"
          value={audienceCount}
          onChange={onChange}
          className="bg-white border-pharmacy-border1"
        />
      </div>
    </div>
  );
};

export default AudienceSelector;
