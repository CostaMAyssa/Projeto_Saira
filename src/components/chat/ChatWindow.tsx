import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './chat-window/ChatHeader';
import MessageList from './chat-window/MessageList';
import MessageInput from './chat-window/MessageInput';
import EmptyState from './chat-window/EmptyState';
import { Message } from './types';
// import { mockMessages } from './mockMessages'; // Will be removed
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { createEvolutionSocket } from '@/lib/websocket';

interface ChatWindowProps {
  activeConversation: string | null;
  onBackClick?: () => void;
  isMobile: boolean;
}

interface DbMessage {
  id: string;
  content: string;
  sender: 'user' | 'client';
  sent_at: string;
}

interface ConversationDetails {
  id: string;
  phone_number: string;
  name: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  activeConversation, 
  onBackClick,
  isMobile
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<ReturnType<typeof createEvolutionSocket> | null>(null);
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  // Buscar detalhes da conversa
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!activeConversation) {
        setConversationDetails(null);
        return;
      }

      const { data, error } = await supabase
        .from('unified_conversations')
        .select('id, phone_number, name')
        .eq('id', activeConversation)
        .single();

      if (error) {
        console.error('Erro ao buscar detalhes da conversa:', error);
      } else {
        setConversationDetails(data);
      }
    };

    fetchConversationDetails();
  }, [activeConversation]);
  
  // Buscar configurações da Evolution API
  useEffect(() => {
    const fetchEvolutionSettings = async () => {
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('api_url, api_key, instance_name, global_mode')
        .limit(1)
        .single();

      if (settingsError) {
        console.error('Erro ao buscar configurações:', settingsError);
        setConnectionStatus('disconnected');
        return;
      }

      if (settings && activeConversation) {
        try {
          setConnectionStatus('connecting');
          
          const websocket = createEvolutionSocket(
            settings.api_url || 'https://evoapi.insignemarketing.com.br',
            settings.api_key || '33cf7bf9876391ff485115742bdb149a',
            {
              instanceName: settings.instance_name,
              globalMode: settings.global_mode !== undefined ? settings.global_mode : true
            }
          );
          
          websocket.addMessageHandler((message) => {
            console.log('📨 Mensagem recebida via WebSocket:', message);
            setMessages(prev => [...prev, message]);
          });

          websocket.addConnectionHandler((status) => {
            console.log('🔗 Status de conexão:', status);
            if (status === 'open') {
              setConnectionStatus('connected');
            } else if (status === 'close') {
              setConnectionStatus('disconnected');
            }
          });
          
          websocket.connect();
          setWs(websocket);
          
          setTimeout(() => {
            if (!websocket.isConnected()) {
              console.error('❌ WebSocket não conectou - provavelmente está desabilitado no servidor');
              setConnectionStatus('error');
            }
          }, 5000);
          
          return () => {
            websocket.disconnect();
          };
        } catch (error) {
          console.error('❌ Erro ao conectar WebSocket:', error);
          setConnectionStatus('error');
        }
      }
    };

    fetchEvolutionSettings();
  }, [activeConversation]);
  
  // Carregar mensagens do Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        setMessages([]);
      } else if (data) {
        const fetchedMessages: Message[] = (data as DbMessage[]).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender === 'user' ? 'pharmacy' : 'client',
          timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(fetchedMessages);
      }
    };

    fetchMessages();
  }, [activeConversation]);
  
  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeConversation || !conversationDetails) return;
    
    const currentTime = new Date();
    const timeString = currentTime.getHours() + ':' + 
                      (currentTime.getMinutes() < 10 ? '0' : '') + 
                      currentTime.getMinutes();
    
    const newMessage: Message = {
      id: `${activeConversation}-${Date.now()}`,
      content: content,
      sender: 'pharmacy',
      timestamp: timeString,
    };
    
    let success = false;
    if (ws) {
      success = await ws.sendMessageViaAPI(content, conversationDetails.phone_number);
    }
    
    if (!success) {
      console.error('❌ Falha ao enviar mensagem via API - Verifique se a Evolution API está funcionando');
      try {
        const response = await fetch('https://evoapi.insignemarketing.com.br/message/sendText/default', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': '33cf7bf9876391ff485115742bdb149a'
          },
          body: JSON.stringify({
            number: conversationDetails.phone_number,
            text: content
          })
        });
        
        if (response.ok) {
          success = true;
          console.log('✅ Mensagem enviada via fallback');
        }
      } catch (error) {
        console.error('❌ Fallback também falhou:', error);
      }
    }
    
    if (!success) {
      alert('Erro ao enviar mensagem. Verifique se a Evolution API está funcionando.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation,
          content: content,
          sender: 'user',
          sent_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Erro ao salvar mensagem:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
    
    setMessages(prev => [...prev, newMessage]);
  }, [activeConversation, ws, conversationDetails]);
  
  if (!activeConversation) {
    return <EmptyState />;
  }
  
  return (
    <div className="h-full flex flex-col bg-white relative font-sans">
      {connectionStatus !== 'connected' && (
        <div className={`px-3 py-2 text-xs text-center ${
          connectionStatus === 'error' 
            ? 'bg-red-100 text-red-700' 
            : connectionStatus === 'connecting'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {connectionStatus === 'error' && '❌ WebSocket desconectado - Verifique se WEBSOCKET_ENABLED=true no servidor'}
          {connectionStatus === 'connecting' && '🔄 Conectando WebSocket...'}
          {connectionStatus === 'disconnected' && '⏸️ WebSocket desconectado'}
        </div>
      )}
      
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-cover bg-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=')]"></div>
      <ChatHeader 
        activeConversation={activeConversation} 
        onBackClick={onBackClick}
        isMobile={isMobile}
      />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
