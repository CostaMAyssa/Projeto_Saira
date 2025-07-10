import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, MessageSquare, UserCheck, UserX, Edit, Trash2 } from 'lucide-react';
import { EditClientModal } from './modals/EditClientModal';
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

interface ClientCardProps {
  client: Client;
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getTagBadge: (tag: string) => React.ReactNode;
  onOpenEditModal?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onToggleStatus?: (client: Client) => void;
}

const ClientCard = ({ 
  client, 
  getStatusBadge, 
  getTagBadge,
  onOpenEditModal,
  onDeleteClient,
  onToggleStatus 
}: ClientCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [status, setStatus] = useState<'active' | 'inactive'>(client.status);
  const [tags, setTags] = useState<string[]>([...client.tags]);
  const navigate = useNavigate();

  const handleEditClick = () => {
    if (onOpenEditModal) {
      onOpenEditModal(client);
    } else {
      // Fallback para modal local
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email);
      setStatus(client.status);
      setTags([...client.tags]);
      setIsEditModalOpen(true);
    }
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
    setIsSendMessageModalOpen(true);
  };

  const handleSendMessageSuccess = (conversationId: string) => {
    // Navegar para o chat com a conversa criada
    navigate(`/chat?conversation=${conversationId}`);
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus(client);
    } else {
      console.log(`Alterando status do cliente ${client.id} para ${client.status === 'active' ? 'inactive' : 'active'}`);
    }
  };

  const handleDeleteClient = () => {
    if (onDeleteClient) {
      onDeleteClient(client.id);
    } else {
      console.log('Excluindo cliente:', client.id);
    }
  };

  return (
    <>
      <Card className="bg-white border border-pharmacy-border1 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-pharmacy-text1 text-lg">{client.name}</h3>
              <div className="space-y-1 mt-2">
                <p className="text-sm text-pharmacy-text2">{client.phone}</p>
                <p className="text-sm text-pharmacy-text2">{client.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(client.status)}
            </div>
          </div>

          {client.last_purchase && (
            <div className="mb-3">
              <p className="text-xs text-pharmacy-text2">
                Última compra: {client.last_purchase}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {client.tags.map((tag) => (
              <div key={tag}>
                {getTagBadge(tag)}
              </div>
            ))}
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
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <EditClientModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        client={client}
        onSave={handleSaveEdit}
      />

      {/* Modal de Envio de Mensagem */}
      <SendMessageModal
        open={isSendMessageModalOpen}
        onOpenChange={setIsSendMessageModalOpen}
        client={client}
        onSuccess={handleSendMessageSuccess}
      />
    </>
  );
};

export default ClientCard;
