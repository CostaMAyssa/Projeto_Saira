import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './chat-window/ChatHeader';
import MessageList from './chat-window/MessageList';
import MessageInput from './chat-window/MessageInput';
import EmptyState from './chat-window/EmptyState';
import { Message, Conversation } from './types';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/contexts/SupabaseContext';
import { formatMessageTimestamp } from '@/lib/utils';

interface ChatWindowProps {
  activeConversation: string | null;
  onBackClick?: () => void;
  isMobile: boolean;
  conversations?: Conversation[];
  evolutionInstance?: string;
  saleMessage?: string; // Nova prop para mensagem de venda
}

interface DbMessage {
  id: string;
  content: string;
  sender: 'user' | 'client';
  sent_at: string;
  message_id?: string;
  from_me?: boolean;
  timestamp?: string;
  message_type?: 'text' | 'image' | 'audio' | 'document';
  media_url?: string;
  media_type?: string;
  file_name?: string;
  file_size?: number;
  transcription?: string;
  caption?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  activeConversation, 
  onBackClick,
  isMobile,
  conversations = [],
  evolutionInstance,
  saleMessage: externalSaleMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageIds, setMessageIds] = useState<Set<string>>(new Set());
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [saleMessage, setSaleMessage] = useState<string>(externalSaleMessage || ''); // Estado para mensagem de venda
  // Função para capturar mensagem de venda
  const handleSaleMessage = useCallback((message: string) => {
    setSaleMessage(message);
  }, []);

  // Limpar mensagem de venda quando a conversa mudar
  useEffect(() => {
    setSaleMessage('');
  }, [activeConversation]);

  // Atualizar mensagem de venda quando a prop externa mudar
  useEffect(() => {
    if (externalSaleMessage) {
      console.log('📥 ChatWindow recebeu mensagem de venda externa:', externalSaleMessage);
      setSaleMessage(externalSaleMessage);
    }
  }, [externalSaleMessage]);

  // Log quando a mensagem está sendo passada para o MessageInput
  useEffect(() => {
    if (saleMessage) {
      console.log('📤 ChatWindow passando mensagem para MessageInput:', saleMessage);
    }
  }, [saleMessage]);

  const { user } = useSupabase();
  
  // Listener Supabase Realtime para mensagens - OTIMIZADO
  useEffect(() => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`messages-convo-${activeConversation}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation}`
        },
        (payload) => {
          console.log('📨 Nova mensagem via Supabase Realtime:', payload.new);
          const msg = payload.new as DbMessage;
          
          const messageId = msg.id; // Usar o ID do banco como fonte da verdade
          
          if (messageIds.has(messageId)) {
            console.log('⚠️ Mensagem duplicada ignorada:', messageId);
            return;
          }

          const newMessage: Message = {
            id: messageId,
            content: msg.content,
            sender: msg.sender,
            timestamp: formatMessageTimestamp(msg.sent_at),
            message_type: msg.message_type || 'text',
            media_url: msg.media_url,
            media_type: msg.media_type,
            file_name: msg.file_name,
            file_size: msg.file_size,
            transcription: msg.transcription,
            caption: msg.caption
          };

          setMessages(prev => {
            // Evita adicionar se já existir
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          setMessageIds(prev => new Set(prev).add(messageId));

          // Verificar se é uma mensagem de venda
          if (msg.content && msg.content.includes('Venda registrada com sucesso')) {
            console.log('💰 Nova venda registrada:', msg.content);
            setSaleMessage(msg.content);
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation}`
        },
        (payload) => {
          console.log('🔄 Mensagem atualizada via Supabase Realtime:', payload.new);
          const msg = payload.new as DbMessage;
          const messageId = msg.id;
          
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, content: msg.content, media_url: msg.media_url, file_name: msg.file_name }
              : m
          ));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔔 Canal Realtime conectado para conversa:', activeConversation);
          setRealtimeStatus('connected');
        } else {
          console.warn('⚠️ Canal Realtime não conectado. Status:', status);
          setRealtimeStatus('disconnected');
        }
      });

    return () => {
      console.log('🔌 Desconectando listener da conversa:', activeConversation);
      supabase.removeChannel(channel);
    };
  }, [activeConversation]); // Removida dependência messageIds
  
  // Carregar mensagens do Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) {
        setMessages([]);
        setMessageIds(new Set());
        return;
      }

      console.log(`📚 Carregando histórico para conversa: ${activeConversation}`);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        setMessages([]);
        setMessageIds(new Set());
      } else if (data) {
        const fetchedMessages: Message[] = (data as DbMessage[]).map(msg => ({
          id: msg.id, // Usar sempre o ID do banco
          content: msg.content,
          sender: msg.sender,
          timestamp: formatMessageTimestamp(msg.sent_at),
          message_type: msg.message_type || 'text',
          media_url: msg.media_url,
          media_type: msg.media_type,
          file_name: msg.file_name,
          file_size: msg.file_size,
          transcription: msg.transcription,
          caption: msg.caption
        }));
        
        const ids = new Set(fetchedMessages.map(m => m.id));
        setMessages(fetchedMessages);
        setMessageIds(ids);
        console.log(`✅ ${fetchedMessages.length} mensagens históricas carregadas. Remetentes:`, 
          JSON.stringify(fetchedMessages.map(m => m.sender))
        );
      }
    };

    fetchMessages();
  }, [activeConversation]);
  
  // Função de envio de mensagem com HTTP Request para o n8n
  const handleSendMessage = useCallback(async (content: string, filePayload?: { name: string; base64: string; type: string }) => {
    if (!activeConversation || (!content.trim() && !filePayload)) return;

    // Buscar dados da conversa e da instância Evolution do banco se não estiverem disponíveis
    let clientPhone = '';
    let clientName = '';
    let clientId = '';
    let evolutionInstanceName = evolutionInstance || '';

    // Buscar dados da conversa (JOIN com clients)
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select(`id, client_id, clients (name, phone), assigned_to`)
      .eq('id', activeConversation)
      .single();

    if (!conversationError && conversationData) {
      clientId = conversationData.client_id || '';
      const clients = conversationData.clients;
      if (Array.isArray(clients) && clients.length > 0 && typeof clients[0] === 'object' && 'name' in clients[0] && 'phone' in clients[0]) {
        clientName = (clients[0] as { name?: string }).name || '';
        clientPhone = (clients[0] as { phone?: string }).phone || '';
      } else if (clients && typeof clients === 'object' && 'name' in clients && 'phone' in clients) {
        clientName = (clients as { name?: string }).name || '';
        clientPhone = (clients as { phone?: string }).phone || '';
      }
      // Buscar settings do usuário responsável para pegar a instância Evolution
      const assignedTo = conversationData.assigned_to;
      if (!evolutionInstanceName && assignedTo) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('evolution_instance_name')
          .eq('user_id', assignedTo)
          .single();
        if (!settingsError && settingsData) {
          evolutionInstanceName = settingsData.evolution_instance_name || '';
        }
      }
    }

    const userId = user?.id || '';

    // A atualização otimista será substituída pela resposta do Realtime.
    // Opcional: manter uma UI de "enviando..." que é removida quando a mensagem real chega.
    // Por simplicidade, vamos confiar no Realtime para adicionar a mensagem.

    try {
      // 2. Enviar para a função do Supabase
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-message`;

      if (!webhookUrl) {
        console.error("URL da função 'send-message' não configurada.");
        return;
      }

      const body = {
            conversationId: activeConversation,
            text: content,
            userId,
            evolutionInstance: evolutionInstanceName,
            clientPhone,
            clientName,
            clientId
      };

      if (filePayload) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ ...body, file: filePayload, text: content })
        });
      } else {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ ...body, text: content })
        });
      }

    } catch (error) {
      console.error("Erro ao chamar a função 'send-message':", error);
    }
  }, [activeConversation, user, evolutionInstance]);

  // Função de envio de áudio
  const handleSendAudio = useCallback(async (audioBlob: Blob, fileName: string) => {
    if (!activeConversation || !user?.id) return;

    try {
      // Buscar dados da conversa
      let clientPhone = '';
      let clientName = '';
      let clientId = '';
      let evolutionInstanceName = evolutionInstance || '';

      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select(`id, client_id, clients (name, phone), assigned_to`)
        .eq('id', activeConversation)
        .single();

      if (conversationError || !conversationData) {
        console.error('Erro ao buscar dados da conversa:', conversationError);
        return;
      }

      clientId = conversationData.client_id || '';
      const clients = conversationData.clients;
      if (Array.isArray(clients) && clients.length > 0 && typeof clients[0] === 'object' && 'name' in clients[0] && 'phone' in clients[0]) {
        clientName = (clients[0] as { name?: string }).name || '';
        clientPhone = (clients[0] as { phone?: string }).phone || '';
      } else if (clients && typeof clients === 'object' && 'name' in clients && 'phone' in clients) {
        clientName = (clients as { name?: string }).name || '';
        clientPhone = (clients as { phone?: string }).phone || '';
      }
      
      // Buscar instância Evolution
      const assignedTo = conversationData.assigned_to;
      if (!evolutionInstanceName && assignedTo) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('evolution_instance_name')
          .eq('user_id', assignedTo)
          .single();
        if (!settingsError && settingsData) {
          evolutionInstanceName = settingsData.evolution_instance_name || '';
        }
      }

      const optimisticId = `${activeConversation}-audio-${Date.now()}`;
      
      // A atualização otimista de áudio pode ser mantida se desejado,
      // mas a mensagem real virá do Realtime.
      // Por simplicidade, removeremos a UI otimista daqui também.

      // 2. Converter Blob para base64 de forma segura
      const toBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      
      const base64Audio = await toBase64(audioBlob);

      // 3. Enviar para a função send-message
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-message`;

      if (!webhookUrl) {
        // Remover mensagem otimista se ela existisse
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          conversationId: activeConversation,
          audio: {
            base64: base64Audio.split(',')[1], // Envia apenas o base64 puro
            name: fileName,
            type: 'audio/webm'
          },
          userId: user.id,
          evolutionInstance: evolutionInstanceName,
          clientPhone,
          clientName,
          clientId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Áudio enviado para processamento:', result);

    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      // Remover mensagem otimista em caso de erro
    }
  }, [activeConversation, user, evolutionInstance]);
  
  if (!activeConversation) {
    return (
      <div className="flex flex-1 items-center justify-center h-full bg-white">
        <div className="text-center text-gray-400">
          <h2 className="text-lg font-semibold mb-2">Selecione uma conversa para começar</h2>
          <p className="text-sm">ou inicie uma nova conversa</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-white relative font-sans">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-cover bg-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3Njape.org5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=')]"></div>
      <ChatHeader 
        activeConversation={activeConversation}
        onBackClick={onBackClick}
        isMobile={isMobile}
        realtimeStatus={realtimeStatus}
      />
      <MessageList messages={messages} />
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onSendAudio={handleSendAudio} 
        initialMessage={saleMessage}
      />
    </div>
  );
};

export default ChatWindow;
