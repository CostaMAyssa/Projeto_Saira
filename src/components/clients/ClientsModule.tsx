
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Filter, UserPlus } from 'lucide-react';

const ClientsModule = () => {
  const mockClients = [
    {
      id: '1',
      name: 'João Silva',
      phone: '+55 11 98765-4321',
      email: 'joao.silva@email.com',
      status: 'active',
      tags: ['hipertenso', 'uso contínuo', 'cliente fiel'],
      lastInteraction: '2 dias atrás'
    },
    {
      id: '2',
      name: 'Maria Oliveira',
      phone: '+55 11 91234-5678',
      email: 'maria.oliveira@email.com',
      status: 'active',
      tags: ['diabético', 'uso contínuo'],
      lastInteraction: '1 semana atrás'
    },
    {
      id: '3',
      name: 'Carlos Mendes',
      phone: '+55 11 99876-5432',
      email: 'carlos.mendes@email.com',
      status: 'active',
      tags: ['hipertenso', 'uso contínuo'],
      lastInteraction: '3 dias atrás'
    },
    {
      id: '4',
      name: 'Ana Beatriz',
      phone: '+55 11 97654-3210',
      email: 'ana.beatriz@email.com',
      status: 'inactive',
      tags: ['uso contínuo'],
      lastInteraction: '1 mês atrás'
    },
    {
      id: '5',
      name: 'Pedro Santos',
      phone: '+55 11 98877-6655',
      email: 'pedro.santos@email.com',
      status: 'active',
      tags: ['antibiótico'],
      lastInteraction: '1 dia atrás'
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes por nome, telefone ou email..."
            className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
        </div>
        <Button variant="outline" className="text-pharmacy-green2 border-pharmacy-green1">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      <div className="bg-pharmacy-dark2 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-dark1 text-pharmacy-green2 font-medium">
          <div className="col-span-3">Nome</div>
          <div className="col-span-2">Telefone</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Última Interação</div>
        </div>
        
        {mockClients.map((client) => (
          <div 
            key={client.id} 
            className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-dark1 hover:bg-pharmacy-dark1 cursor-pointer"
          >
            <div className="col-span-3 text-white font-medium">{client.name}</div>
            <div className="col-span-2 text-muted-foreground">{client.phone}</div>
            <div className="col-span-3 text-muted-foreground">{client.email}</div>
            <div className="col-span-2">
              <Badge 
                className={client.status === 'active' ? "bg-green-600" : "bg-gray-500"}
              >
                {client.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              <div className="mt-1 flex flex-wrap gap-1">
                {client.tags.slice(0, 2).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="bg-pharmacy-dark1 border-pharmacy-green1 text-xs text-pharmacy-green2"
                  >
                    {tag}
                  </Badge>
                ))}
                {client.tags.length > 2 && (
                  <Badge variant="outline" className="bg-pharmacy-dark1 border-pharmacy-green1 text-xs text-pharmacy-green2">
                    +{client.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
            <div className="col-span-2 text-muted-foreground">{client.lastInteraction}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Exibindo 5 de 142 clientes
      </div>
    </div>
  );
};

export default ClientsModule;
