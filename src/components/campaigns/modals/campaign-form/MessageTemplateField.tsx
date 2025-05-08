
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MessageTemplateFieldProps {
  messageTemplate: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const MessageTemplateField: React.FC<MessageTemplateFieldProps> = ({ 
  messageTemplate, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="messageTemplate" className="text-pharmacy-text1">Modelo de Mensagem</Label>
      <Textarea
        id="messageTemplate"
        value={messageTemplate}
        onChange={onChange}
        placeholder="Digite a mensagem que será enviada..."
        className="bg-white border-pharmacy-border1 min-h-[100px]"
      />
      <p className="text-xs text-pharmacy-text2">
        Use {'{nome}'}, {'{produto}'}, {'{medicamento}'} para personalizar a mensagem.
      </p>
    </div>
  );
};

export default MessageTemplateField;
