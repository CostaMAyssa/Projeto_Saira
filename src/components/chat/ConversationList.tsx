
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Conversation = {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: 'read' | 'delivered' | 'sent' | 'pending';
  tags: string[];
};

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+55 11 98765-4321',
    lastMessage: 'Posso retirar meu remédio hoje?',
    time: '10:42',
    unread: 2,
    status: 'read',
    tags: ['uso contínuo'],
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    phone: '+55 11 91234-5678',
    lastMessage: 'Obrigada pelo atendimento!',
    time: '09:15',
    unread: 0,
    status: 'delivered',
    tags: ['diabético'],
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    phone: '+55 11 99876-5432',
    lastMessage: 'Vocês têm Losartana em estoque?',
    time: 'Ontem',
    unread: 0,
    status: 'read',
    tags: ['hipertenso', 'uso contínuo'],
  },
  {
    id: '4',
    name: 'Ana Beatriz',
    phone: '+55 11 97654-3210',
    lastMessage: 'Preciso do anticoncepcional...',
    time: 'Ontem',
    unread: 0,
    status: 'sent',
    tags: ['uso contínuo'],
  },
  {
    id: '5',
    name: 'Pedro Santos',
    phone: '+55 11 98877-6655',
    lastMessage: 'O antibiótico está disponível?',
    time: '25/04',
    unread: 0,
    status: 'pending',
    tags: ['antibiótico'],
  },
];

const StatusIcon = ({ status }: { status: Conversation['status'] }) => {
  switch (status) {
    case 'read':
      return <span className="text-blue-400">✓✓</span>;
    case 'delivered':
      return <span className="text-gray-400">✓✓</span>;
    case 'sent':
      return <span className="text-gray-400">✓</span>;
    case 'pending':
      return <span className="text-gray-400">🕓</span>;
    default:
      return null;
  }
};

interface ConversationListProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  activeConversation, 
  setActiveConversation 
}) => {
  return (
    <div className="h-full bg-pharmacy-dark1 border-r border-pharmacy-dark2 flex flex-col">
      <div className="p-4 border-b border-pharmacy-dark2">
        <h2 className="text-lg font-medium mb-3 text-white">Conversas</h2>
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversa..."
            className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Badge variant="outline" className="bg-pharmacy-dark2 text-pharmacy-green2 hover:bg-pharmacy-green2 hover:text-white cursor-pointer">
              Todos
            </Badge>
            <Badge variant="outline" className="bg-pharmacy-dark2 text-pharmacy-green2 hover:bg-pharmacy-green2 hover:text-white cursor-pointer">
              Não lidos
            </Badge>
          </div>
          <button className="flex items-center gap-1 text-pharmacy-green2 text-sm hover:text-pharmacy-accent transition-colors">
            <Filter className="h-3 w-3" />
            Filtros
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {mockConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={cn(
              "p-4 hover:bg-pharmacy-dark2 cursor-pointer conversation-item",
              activeConversation === conversation.id && "active"
            )}
            onClick={() => setActiveConversation(conversation.id)}
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium text-white">{conversation.name}</span>
              <span className="text-xs text-muted-foreground">{conversation.time}</span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-muted-foreground">{conversation.phone}</span>
            </div>
            
            <div className="flex justify-between items-start">
              <p className="text-sm text-pharmacy-green2 truncate pr-2 max-w-[80%]">
                {conversation.lastMessage}
              </p>
              <div className="flex items-center gap-1">
                <StatusIcon status={conversation.status} />
                {conversation.unread > 0 && (
                  <span className="bg-pharmacy-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unread}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 mt-2">
              {conversation.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="bg-pharmacy-dark2 border-pharmacy-green1 text-xs text-pharmacy-green2"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
