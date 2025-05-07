
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center bg-pharmacy-dark2">
      <div className="text-center text-muted-foreground">
        <p className="mb-2">Selecione uma conversa para começar</p>
        <p className="text-sm">ou inicie uma nova conversa</p>
      </div>
    </div>
  );
};

export default EmptyState;
