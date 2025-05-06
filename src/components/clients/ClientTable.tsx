
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal } from 'lucide-react';
import { Client } from './types';

interface ClientTableProps {
  clients: Client[];
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
}

const ClientTable = ({ clients, getStatusBadge, getTagBadge }: ClientTableProps) => {
  return (
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
          {clients.map((client) => (
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
};

export default ClientTable;
