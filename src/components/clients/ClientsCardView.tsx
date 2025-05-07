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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {clients.map((client) => (
        <ClientCard 
          key={client.id} 
          client={client} 
          getStatusBadge={getStatusBadge} 
          getTagBadge={getTagBadge} 
        />
      ))}
      {clients.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          Nenhum cliente encontrado com os critérios de busca atuais.
        </div>
      )}
    </div>
  );
};

export default ClientsCardView;
