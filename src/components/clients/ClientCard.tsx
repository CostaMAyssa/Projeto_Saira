import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client } from './types';
import { Edit, MoreHorizontal, MessageSquare, UserCheck, UserX, Trash2, Phone, Mail, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ClientCardProps {
  client: Client;
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
}

const ClientCard = ({ client, getStatusBadge, getTagBadge }: ClientCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [status, setStatus] = useState<'active' | 'inactive'>(client.status);
  const [tags, setTags] = useState<string[]>([...client.tags]);

  const handleEditClick = () => {
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setStatus(client.status);
    setTags([...client.tags]);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = () => {
    // Em uma implementação real, você salvaria as alterações no cliente
    console.log('Salvando edições para cliente:', client.id);
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
    <>
      <Card className="bg-white border border-pharmacy-border1 p-4 rounded-xl flex flex-col h-full relative shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-pharmacy-text1 truncate mr-3">{client.name}</h3>
          {getStatusBadge(client.status)}
        </div>
        
        <div className="space-y-2 flex-grow">
          <div className="flex items-center text-pharmacy-text2 text-sm">
            <Phone className="h-4 w-4 mr-2 text-pharmacy-accent" />
            <span className="truncate">{client.phone}</span>
          </div>
          <div className="flex items-center text-pharmacy-text2 text-sm">
            <Mail className="h-4 w-4 mr-2 text-pharmacy-accent" />
            <span className="truncate">{client.email}</span>
          </div>
          <div className="flex items-center text-pharmacy-text2 text-sm">
            <ShoppingBag className="h-4 w-4 mr-2 text-pharmacy-accent" />
            <span className="truncate">Última: {client.lastPurchase}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {client.tags.map((tag, idx) => (
              <span key={`tag-${idx}`}>{getTagBadge(tag)}</span>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-3 pt-3 border-t border-pharmacy-border1 z-10">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-pharmacy-text2 hover:text-pharmacy-accent p-2"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-pharmacy-text2 hover:text-pharmacy-accent p-2"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-pharmacy-border1 text-pharmacy-text1 shadow-md">
              <DropdownMenuItem 
                onClick={handleToggleStatus}
                className="hover:bg-pharmacy-light2 cursor-pointer"
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
                className="hover:bg-pharmacy-light2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Enviar Mensagem</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteClient}
                className="text-red-500 hover:bg-pharmacy-light2 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="bg-white border border-pharmacy-border1 text-pharmacy-text1 w-[calc(100%-32px)] max-w-lg mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-pharmacy-accent text-xl text-center sm:text-left">Editar Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="card-edit-name" className="text-pharmacy-text1">Nome</Label>
              <Input
                id="card-edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-gray-300 text-pharmacy-text1"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="card-edit-phone" className="text-pharmacy-text1">Telefone</Label>
              <Input
                id="card-edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-gray-300 text-pharmacy-text1"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="card-edit-email" className="text-pharmacy-text1">Email</Label>
              <Input
                id="card-edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-300 text-pharmacy-text1"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="card-edit-status" className="text-pharmacy-text1">Status</Label>
              <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-pharmacy-text1">Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="card-edit-tag-vip" 
                    checked={tags.includes('vip')} 
                    onCheckedChange={() => handleTagToggle('vip')} 
                    className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                  />
                  <label htmlFor="card-edit-tag-vip" className="text-sm font-medium text-pharmacy-text1">VIP</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="card-edit-tag-regular" 
                    checked={tags.includes('regular')} 
                    onCheckedChange={() => handleTagToggle('regular')} 
                    className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                  />
                  <label htmlFor="card-edit-tag-regular" className="text-sm font-medium text-pharmacy-text1">Regular</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="card-edit-tag-occasional" 
                    checked={tags.includes('occasional')} 
                    onCheckedChange={() => handleTagToggle('occasional')} 
                    className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                  />
                  <label htmlFor="card-edit-tag-occasional" className="text-sm font-medium text-pharmacy-text1">Ocasional</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="card-edit-tag-continuous" 
                    checked={tags.includes('continuous')} 
                    onCheckedChange={() => handleTagToggle('continuous')} 
                    className="border-gray-300 data-[state=checked]:bg-pharmacy-accent"
                  />
                  <label htmlFor="card-edit-tag-continuous" className="text-sm font-medium text-pharmacy-text1">Uso Contínuo</label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4 sm:mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseEditModal}
              className="bg-white text-pharmacy-text2 border-gray-300 hover:bg-pharmacy-light2"
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

export default ClientCard;
