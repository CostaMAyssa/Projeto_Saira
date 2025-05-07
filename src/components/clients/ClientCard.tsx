import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from './types';
import { Edit, MoreHorizontal, MessageSquare, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ClientCardProps {
  client: Client;
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
}

const ClientCard = ({ client, getStatusBadge, getTagBadge }: ClientCardProps) => {
  const handleSendMessage = () => {
    console.log('Enviando mensagem para cliente:', client.id);
  };

  const handleToggleStatus = () => {
    console.log(`Alterando status do cliente ${client.id} para ${client.status === 'active' ? 'inactive' : 'active'}`);
  };

  const handleDeleteClient = () => {
    console.log('Excluindo cliente:', client.id);
  };

  return (
    <Card key={client.id} className="bg-pharmacy-dark2 border-pharmacy-dark1 p-4 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white truncate mr-3">{client.name}</h3>
        {getStatusBadge(client.status)}
      </div>
      
      <div className="space-y-2 flex-grow">
        <div className="flex items-center text-muted-foreground text-sm">
          <span className="inline-block w-5">📱</span> 
          <span className="truncate">{client.phone}</span>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <span className="inline-block w-5">✉️</span> 
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <span className="inline-block w-5">🛒</span> 
          <span className="truncate">Última: {client.lastPurchase}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {client.tags.map((tag, idx) => (
            <span key={`tag-${idx}`}>{getTagBadge(tag)}</span>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-3 pt-3 border-t border-pharmacy-dark1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-pharmacy-green2 hover:text-pharmacy-accent"
          onClick={() => console.log('Editar cliente:', client.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-pharmacy-green2 hover:text-pharmacy-accent">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-pharmacy-dark2 border-pharmacy-dark1 text-white">
            <DropdownMenuItem 
              onClick={handleToggleStatus}
              className="hover:bg-pharmacy-dark1 cursor-pointer"
            >
              {client.status === 'active' ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  <span>Desativar</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  <span>Ativar</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleSendMessage}
              className="hover:bg-pharmacy-dark1 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Enviar Mensagem</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default ClientCard;
