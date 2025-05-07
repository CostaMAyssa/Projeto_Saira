import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = {
  id: string;
  content: string;
  sender: 'client' | 'pharmacy';
  timestamp: string;
};

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      content: 'Olá, bom dia! Gostaria de saber se vocês têm Losartana em estoque?',
      sender: 'client',
      timestamp: '10:30',
    },
    {
      id: '1-2',
      content: 'Bom dia, Sr. João! Sim, temos Losartana disponível. Qual a dosagem que o senhor precisa?',
      sender: 'pharmacy',
      timestamp: '10:32',
    },
    {
      id: '1-3',
      content: 'Preciso da Losartana de 50mg, caixa com 30 comprimidos.',
      sender: 'client',
      timestamp: '10:35',
    },
    {
      id: '1-4',
      content: 'Perfeito, temos disponível. O preço é R$ 22,90. O senhor vai querer reservar para retirada?',
      sender: 'pharmacy',
      timestamp: '10:37',
    },
    {
      id: '1-5',
      content: 'Sim, por favor. Posso retirar meu remédio hoje?',
      sender: 'client',
      timestamp: '10:42',
    },
  ],
  '2': [
    {
      id: '2-1',
      content: 'Olá, preciso de uma caixa de Insulina Lantus. Vocês têm?',
      sender: 'client',
      timestamp: '09:10',
    },
    {
      id: '2-2',
      content: 'Bom dia, Sra. Maria! Sim, temos Insulina Lantus disponível. Gostaria de reservar?',
      sender: 'pharmacy',
      timestamp: '09:12',
    },
    {
      id: '2-3',
      content: 'Sim, por favor. Vou passar para retirar à tarde.',
      sender: 'client',
      timestamp: '09:13',
    },
    {
      id: '2-4',
      content: 'Perfeito! Vou deixar reservado em seu nome. Pode retirar até às 19h de hoje.',
      sender: 'pharmacy',
      timestamp: '09:14',
    },
    {
      id: '2-5',
      content: 'Obrigada pelo atendimento!',
      sender: 'client',
      timestamp: '09:15',
    },
  ],
};

interface ChatWindowProps {
  activeConversation: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeConversation }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && mockMessages[activeConversation]) {
      setMessages(mockMessages[activeConversation]);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !activeConversation) return;
    
    const currentTime = new Date();
    const timeString = currentTime.getHours() + ':' + 
                      (currentTime.getMinutes() < 10 ? '0' : '') + 
                      currentTime.getMinutes();
    
    const newMessageObj: Message = {
      id: `${activeConversation}-${Date.now()}`,
      content: newMessage,
      sender: 'pharmacy',
      timestamp: timeString,
    };
    
    setMessages(prev => [...prev, newMessageObj]);
    setNewMessage('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!activeConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-pharmacy-dark2">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">Selecione uma conversa para começar</p>
          <p className="text-sm">ou inicie uma nova conversa</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-pharmacy-dark2">
      <div className="border-b border-pharmacy-dark1 p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-pharmacy-green1 flex items-center justify-center text-white font-medium mr-3">
            {messages.length > 0 && messages[0].sender === 'client' 
              ? messages[0].content.charAt(0).toUpperCase() 
              : 'C'}
          </div>
          <div>
            <h3 className="font-medium text-white">
              {activeConversation === '1' ? 'João Silva' : 
              activeConversation === '2' ? 'Maria Oliveira' : 
              activeConversation === '3' ? 'Carlos Mendes' : 
              activeConversation === '4' ? 'Ana Beatriz' : 'Pedro Santos'}
            </h3>
            <span className="text-xs text-muted-foreground">
              {activeConversation === '1' ? '+55 11 98765-4321' : 
              activeConversation === '2' ? '+55 11 91234-5678' : 
              activeConversation === '3' ? '+55 11 99876-5432' : 
              activeConversation === '4' ? '+55 11 97654-3210' : '+55 11 98877-6655'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'client' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={message.sender === 'client' ? 'message-bubble-client' : 'message-bubble-pharmacy'}>
              <div className="mb-1">{message.content}</div>
              <div className="text-right">
                <span className="text-xs opacity-70">{message.timestamp}</span>
                {message.sender === 'pharmacy' && (
                  <span className="ml-1 text-xs">✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-pharmacy-dark1">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-pharmacy-green2 hover:text-pharmacy-accent hover:bg-pharmacy-dark1"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="bg-pharmacy-dark1 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-pharmacy-green2 hover:text-pharmacy-accent hover:bg-pharmacy-dark1"
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
            variant="default" 
            size="icon" 
            className="bg-pharmacy-accent hover:bg-pharmacy-green1"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
