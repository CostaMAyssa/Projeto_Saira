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
}

const ClientTable = ({ clients, getStatusBadge, getTagBadge }: ClientTableProps) => {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [tags, setTags] = useState<string[]>([]);

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setStatus(client.status);
    setTags([...client.tags]);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveEdit = () => {
    // Aqui você implementaria a lógica real para salvar as alterações
    console.log('Salvando edições para cliente:', editingClient?.id);
    console.log('Novos dados:', { name, phone, email, status, tags });
    handleCloseEditModal();
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleDeleteClient = (clientId: string) => {
    console.log('Excluindo cliente:', clientId);
    // Aqui você implementaria a lógica real para excluir o cliente
  };

  const handleToggleStatus = (client: Client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    console.log(`Alterando status do cliente ${client.id} para ${newStatus}`);
    // Aqui você implementaria a lógica real para alterar o status
  };

  const handleSendMessage = (clientId: string) => {
    console.log('Enviando mensagem para cliente:', clientId);
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
                        onClick={() => handleEditClick(client)}
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
                            onClick={() => handleToggleStatus(client)}
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
                            onClick={() => handleDeleteClient(client.id)}
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

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 w-[calc(100%-32px)] max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-pharmacy-accent text-xl text-center sm:text-left">Editar Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as 'active' | 'inactive')}>
                <SelectTrigger id="edit-status" className="bg-white border-gray-300">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                {['VIP', 'Regular', 'Uso Contínuo', 'Ocasional'].map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                      className="border-gray-300"
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-gray-900">{tag}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4 sm:mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseEditModal}
              className="bg-white text-gray-700 border-gray-300"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientTable;
