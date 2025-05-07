import React from 'react';
import { MessageSquare } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 bg-pharmacy-whatsapp-primary rounded-full opacity-10"></div>
        <div className="absolute inset-0 flex items-center justify-center text-pharmacy-whatsapp-primary">
          <MessageSquare size={32} />
        </div>
      </div>
      <div className="text-center">
        <p className="mb-2 text-pharmacy-text1 font-medium">Selecione uma conversa para começar</p>
        <p className="text-sm text-pharmacy-text2">ou inicie uma nova conversa</p>
      </div>
    </div>
  );
};

export default EmptyState;
