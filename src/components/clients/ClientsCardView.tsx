import React from 'react';
import ClientCard from './ClientCard';
import { Client } from './types';

interface ClientsCardViewProps {
  clients: Client[];
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
  onOpenEditModal?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onToggleStatus?: (client: Client) => void;
}

const ClientsCardView = ({ 
  clients, 
  getStatusBadge, 
  getTagBadge,
  onOpenEditModal,
  onDeleteClient,
  onToggleStatus 
}: ClientsCardViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {clients.map((client) => (
        <ClientCard 
          key={client.id} 
          client={client} 
          getStatusBadge={getStatusBadge} 
          getTagBadge={getTagBadge}
          onOpenEditModal={onOpenEditModal}
          onDeleteClient={onDeleteClient}
          onToggleStatus={onToggleStatus}
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
