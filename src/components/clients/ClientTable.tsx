import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, MessageSquare, UserCheck, UserX, Edit, Trash2 } from 'lucide-react';
import SendMessageModal from './modals/SendMessageModal';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  tags: string[];
  last_purchase?: string;
}

interface ClientTableProps {
  clients: Client[];
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
  onOpenEditModal: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onToggleStatus: (client: Client) => void;
}

const ClientTable = ({ 
  clients, 
  getStatusBadge, 
  getTagBadge,
  onOpenEditModal,
  onDeleteClient,
  onToggleStatus 
}: ClientTableProps) => {
  const [sendMessageModalOpen, setSendMessageModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();

  const handleSendMessage = (client: Client) => {
    setSelectedClient(client);
    setSendMessageModalOpen(true);
  };

  const handleSendMessageSuccess = (conversationId: string) => {
    // Navegar para o chat com a conversa criada
    navigate(`/chat?conversation=${conversationId}`);
  };

  return (
    <>
      <div className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm w-full">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-gray-900 font-semibold">Nome</TableHead>
                <TableHead className="text-gray-900 font-semibold">Telefone</TableHead>
                <TableHead className="text-gray-900 font-semibold">Email</TableHead>
                <TableHead className="text-gray-900 font-semibold">Última Compra</TableHead>
                <TableHead className="text-gray-900 font-semibold">Tags</TableHead>
                <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                <TableHead className="text-gray-900 font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="border-b border-gray-200 hover:bg-gray-50 h-14">
                  <TableCell className="font-medium text-gray-900">{client.name}</TableCell>
                  <TableCell className="text-gray-600">{client.phone}</TableCell>
                  <TableCell className="text-gray-600">{client.email}</TableCell>
                  <TableCell className="text-gray-600">{client.last_purchase || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <div key={tag}>
                          {getTagBadge(tag)}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onOpenEditModal(client)}
                        className="text-gray-600 hover:text-gray-900 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border-gray-200 text-gray-900">
                          <DropdownMenuItem 
                            onClick={() => onToggleStatus(client)}
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
                            onClick={() => handleSendMessage(client)}
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Enviar Mensagem</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteClient(client.id)}
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

      {/* Modal de Envio de Mensagem */}
      <SendMessageModal
        open={sendMessageModalOpen}
        onOpenChange={setSendMessageModalOpen}
        client={selectedClient}
        onSuccess={handleSendMessageSuccess}
      />
    </>
  );
};

export default ClientTable;
