
import React from 'react';
import ClientCard from './ClientCard';
import { Client } from './types';

interface ClientsCardViewProps {
  clients: Client[];
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
}

const ClientsCardView = ({ clients, getStatusBadge, getTagBadge }: ClientsCardViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <ClientCard 
          key={client.id} 
          client={client} 
          getStatusBadge={getStatusBadge} 
          getTagBadge={getTagBadge} 
        />
      ))}
    </div>
  );
};

export default ClientsCardView;
