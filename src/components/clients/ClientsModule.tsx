
import React, { useState } from 'react';
import ClientSearchHeader from './ClientSearchHeader';
import ClientTable from './ClientTable';
import ClientsCardView from './ClientsCardView';
import { mockClients } from './mockData';
import { getTagBadge, getStatusBadge } from './ClientUtilities';

const ClientsModule = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <ClientSearchHeader viewMode={viewMode} setViewMode={setViewMode} />
      
      {viewMode === 'table' 
        ? <ClientTable 
            clients={mockClients} 
            getStatusBadge={getStatusBadge} 
            getTagBadge={getTagBadge} 
          /> 
        : <ClientsCardView 
            clients={mockClients} 
            getStatusBadge={getStatusBadge} 
            getTagBadge={getTagBadge}
          />
      }
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Exibindo {mockClients.length} de 142 clientes
      </div>
    </div>
  );
};

export default ClientsModule;
