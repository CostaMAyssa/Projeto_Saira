
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="p-4 text-center text-muted-foreground">
      <p>Nenhuma conversa encontrada</p>
      <p className="text-xs mt-1">Tente ajustar seus filtros</p>
    </div>
  );
};

export default EmptyState;
