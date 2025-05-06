
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from './types';

interface ClientCardProps {
  client: Client;
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
}

const ClientCard = ({ client, getStatusBadge, getTagBadge }: ClientCardProps) => {
  return (
    <Card key={client.id} className="bg-pharmacy-dark2 border-pharmacy-dark1 p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-white">{client.name}</h3>
        {getStatusBadge(client.status)}
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-muted-foreground">
          <span className="inline-block w-5">📱</span> {client.phone}
        </div>
        <div className="flex items-center text-muted-foreground">
          <span className="inline-block w-5">✉️</span> {client.email}
        </div>
        <div className="flex items-center text-muted-foreground">
          <span className="inline-block w-5">🛒</span> Última compra: {client.lastPurchase}
        </div>
        <div className="flex flex-wrap mt-2">
          {client.tags.map((tag) => getTagBadge(tag))}
        </div>
      </div>
    </Card>
  );
};

export default ClientCard;
