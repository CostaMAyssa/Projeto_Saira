
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Search, UserPlus, Edit, MoreHorizontal, Cards, Table as TableIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Client data model
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  tags: string[];
  lastPurchase: string;
  isVip?: boolean;
  isRegular?: boolean;
  isOccasional?: boolean;
}

const ClientsModule = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Maria Silva',
      phone: '(11) 98765-4321',
      email: 'maria.silva@email.com',
      status: 'active',
      tags: ['uso continuo', 'vip'],
      lastPurchase: '15/04/2023',
      isVip: true
    },
    {
      id: '2',
      name: 'João Santos',
      phone: '(11) 91234-5678',
      email: 'joao.santos@email.com',
      status: 'inactive',
      tags: ['ocasional'],
      lastPurchase: '23/03/2023',
      isOccasional: true
    },
    {
      id: '3',
      name: 'Ana Oliveira',
      phone: '(11) 99876-5432',
      email: 'ana.oliveira@email.com',
      status: 'active',
      tags: ['uso continuo', 'regular'],
      lastPurchase: '08/04/2023',
      isRegular: true
    },
    {
      id: '4',
      name: 'Carlos Pereira',
      phone: '(11) 98888-7777',
      email: 'carlos.pereira@email.com',
      status: 'active',
      tags: ['regular'],
      lastPurchase: '30/03/2023',
      isRegular: true
    },
    {
      id: '5',
      name: 'Lúcia Ferreira',
      phone: '(11) 97777-8888',
      email: 'lucia.ferreira@email.com',
      status: 'active',
      tags: ['uso continuo', 'vip'],
      lastPurchase: '02/04/2023',
      isVip: true
    },
    {
      id: '6',
      name: 'Roberto Alves',
      phone: '(11) 96666-5555',
      email: 'roberto.alves@email.com',
      status: 'inactive',
      tags: ['inativo'],
      lastPurchase: '12/02/2023'
    },
  ];

  const getTagBadge = (tag: string) => {
    switch(tag.toLowerCase()) {
      case 'uso continuo':
        return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">Uso Contínuo</Badge>;
      case 'vip':
        return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">VIP</Badge>;
      case 'regular':
        return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">Regular</Badge>;
      case 'ocasional':
        return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">Ocasional</Badge>;
      case 'inativo':
        return <Badge className="bg-red-900 text-white mr-1">Inativo</Badge>;
      default:
        return <Badge className="bg-pharmacy-dark1 border-pharmacy-green1 text-pharmacy-green2 mr-1">{tag}</Badge>;
    }
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return status === 'active' 
      ? <Badge className="bg-green-600 text-white">Ativo</Badge>
      : <Badge className="bg-gray-600 text-white">Inativo</Badge>;
  };

  const renderTableView = () => (
    <div className="rounded-xl overflow-hidden bg-pharmacy-dark2">
      <Table>
        <TableHeader className="bg-pharmacy-dark2 border-pharmacy-dark1">
          <TableRow>
            <TableHead className="text-pharmacy-green2 font-medium">Nome</TableHead>
            <TableHead className="text-pharmacy-green2 font-medium">Telefone</TableHead>
            <TableHead className="text-pharmacy-green2 font-medium">Email</TableHead>
            <TableHead className="text-pharmacy-green2 font-medium">Última Compra</TableHead>
            <TableHead className="text-pharmacy-green2 font-medium">Tags</TableHead>
            <TableHead className="text-pharmacy-green2 font-medium">Status</TableHead>
            <TableHead className="text-pharmacy-green2 font-medium">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockClients.map((client) => (
            <TableRow key={client.id} className="border-b border-pharmacy-dark1 hover:bg-pharmacy-dark1">
              <TableCell className="text-white font-medium">{client.name}</TableCell>
              <TableCell className="text-muted-foreground">{client.phone}</TableCell>
              <TableCell className="text-muted-foreground">{client.email}</TableCell>
              <TableCell className="text-muted-foreground">{client.lastPurchase}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {client.tags.map((tag) => getTagBadge(tag))}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(client.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-pharmacy-green2 hover:text-pharmacy-accent">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-pharmacy-green2 hover:text-pharmacy-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockClients.map((client) => (
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
      ))}
    </div>
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-pharmacy-green2 border-pharmacy-green1">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <div className="flex border border-pharmacy-green1 rounded-md overflow-hidden">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              onClick={() => setViewMode('table')} 
              className={`rounded-none ${viewMode === 'table' ? 'bg-pharmacy-accent' : 'bg-transparent text-pharmacy-green2'}`}
            >
              <TableIcon className="h-4 w-4" />
              <span className="ml-2">Tabela</span>
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'} 
              onClick={() => setViewMode('cards')} 
              className={`rounded-none ${viewMode === 'cards' ? 'bg-pharmacy-accent' : 'bg-transparent text-pharmacy-green2'}`}
            >
              <Cards className="h-4 w-4" />
              <span className="ml-2">Cards</span>
            </Button>
          </div>
        </div>
      </div>
      
      {viewMode === 'table' ? renderTableView() : renderCardsView()}
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Exibindo 6 de 142 clientes
      </div>
    </div>
  );
};

export default ClientsModule;
