import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Trash2, UserCheck, UserX, MessageSquare } from 'lucide-react';
import { Client } from './types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ClientTableProps {
  clients: Client[];
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
  onOpenEditModal: (client: Client) => void; // New prop from ClientsModule
  onDeleteClient: (clientId: string) => void; // Prop from ClientsModule
  onToggleStatus: (client: Client) => void; // Prop from ClientsModule
  // onEditClient was the save handler, now handled by modal in ClientsModule
}

const ClientTable = ({ 
  clients, 
  getStatusBadge, 
  getTagBadge,
  onOpenEditModal,
  onDeleteClient,
  onToggleStatus 
}: ClientTableProps) => {
  // Removed local state for edit modal: editingClient, isEditModalOpen, name, phone, email, status, tags
  // Removed local handlers: handleEditClick, handleCloseEditModal, handleSaveEdit, handleTagToggle
  // Local handleDeleteClient and handleToggleStatus are also removed, will use props.

  const handleSendMessage = (clientId: string) => {
    console.log('Enviando mensagem para cliente:', clientId); // This can remain as is or be refactored later
    // Aqui você implementaria a lógica real para enviar mensagem
  };

  return (
    <>
      <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm w-full">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table className="w-full table-auto">
            <TableHeader className="bg-white border-gray-200 sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-gray-600 font-medium py-3">Nome</TableHead>
                <TableHead className="text-gray-600 font-medium py-3">Telefone</TableHead>
                <TableHead className="text-gray-600 font-medium py-3 hidden md:table-cell">Email</TableHead>
                <TableHead className="text-gray-600 font-medium py-3 hidden lg:table-cell">Última Compra</TableHead>
                <TableHead className="text-gray-600 font-medium py-3 hidden md:table-cell">Tags</TableHead>
                <TableHead className="text-gray-600 font-medium py-3">Status</TableHead>
                <TableHead className="text-gray-600 font-medium py-3">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="border-b border-gray-200 hover:bg-gray-50 h-14">
                  <TableCell className="text-gray-900 font-medium py-2">
                    <div className="sm:w-auto min-w-[100px]">{client.name}</div>
                    <div className="md:hidden mt-1 text-xs text-gray-500">{client.email}</div>
                  </TableCell>
                  <TableCell className="text-gray-500 py-2 whitespace-nowrap min-w-[100px]">{client.phone}</TableCell>
                  <TableCell className="text-gray-500 py-2 hidden md:table-cell">{client.email}</TableCell>
                  <TableCell className="text-gray-500 py-2 hidden lg:table-cell whitespace-nowrap">{client.lastPurchase}</TableCell>
                  <TableCell className="py-2 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag, idx) => (
                        <span key={`${client.id}-tag-${idx}`}>{getTagBadge(tag)}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {getStatusBadge(client.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-pharmacy-accent hover:bg-gray-100"
                        onClick={() => onOpenEditModal(client)} // Use prop
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-pharmacy-accent hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border-gray-200 text-gray-900">
                          <DropdownMenuItem 
                            onClick={() => onToggleStatus(client)} // Use prop
                            className="hover:bg-gray-100 cursor-pointer"
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
                            onClick={() => handleSendMessage(client.id)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Enviar Mensagem</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteClient(client.id)} // Use prop
                            className="text-red-500 hover:bg-gray-100 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Removed local Dialog for Edit Modal */}
    </>
  );
};

export default ClientTable;
