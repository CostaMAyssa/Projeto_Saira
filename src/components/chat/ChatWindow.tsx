import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './chat-window/ChatHeader';
import MessageList from './chat-window/MessageList';
import MessageInput from './chat-window/MessageInput';
import EmptyState from './chat-window/EmptyState';
import { Message, Conversation } from './types';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/contexts/SupabaseContext';

interface ChatWindowProps {
  activeConversation: string | null;
  onBackClick?: () => void;
  isMobile: boolean;
  conversations?: Conversation[];
  evolutionInstance?: string;
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
  evolutionInstance
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageIds, setMessageIds] = useState<Set<string>>(new Set());
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const { user } = useSupabase();
  
  // Listener Supabase Realtime para mensagens
  useEffect(() => {
    if (!activeConversation) return;

    console.log('🔔 Configurando listener Supabase Realtime para mensagens');
    setRealtimeStatus('connected');
    
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation}`
        },
        (payload) => {
          console.log('📨 Nova mensagem via Supabase Realtime:', payload);
          const msg = payload.new as DbMessage;
          
          // Evitar duplicatas usando message_id ou id
          const messageId = msg.message_id || msg.id;
          if (messageIds.has(messageId)) {
            console.log('⚠️ Mensagem duplicada ignorada:', messageId);
            return;
          }

          const newMessage: Message = {
            id: messageId,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp || new Date(msg.sent_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            message_type: msg.message_type || 'text',
            media_url: msg.media_url,
            media_type: msg.media_type,
            file_name: msg.file_name,
            file_size: msg.file_size,
            transcription: msg.transcription,
            caption: msg.caption
          };

          setMessages(prev => [...prev, newMessage]);
          setMessageIds(prev => new Set([...prev, messageId]));
          console.log('✅ Mensagem adicionada via Realtime:', newMessage.content.substring(0, 50));
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
          console.log('🔄 Mensagem atualizada via Supabase Realtime:', payload);
          const msg = payload.new as DbMessage;
          const messageId = msg.message_id || msg.id;
          
          setMessages(prev => prev.map(m => 
            m.id === messageId 
              ? { ...m, content: msg.content }
              : m
          ));
        }
      )
      .subscribe((status) => {
        console.log('🔔 Status do canal Realtime:', status);
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      console.log('🔌 Desconectando listener Supabase Realtime');
      setRealtimeStatus('disconnected');
      channel.unsubscribe();
    };
  }, [activeConversation, messageIds]);

  // Carregar mensagens do Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) {
        setMessages([]);
        setMessageIds(new Set());
        return;
      }

      console.log('📚 Carregando histórico de mensagens do Supabase');

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
          id: msg.message_id || msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp || new Date(msg.sent_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
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
        console.log(`📚 ${fetchedMessages.length} mensagens históricas carregadas`);
      }
    };

    fetchMessages();
  }, [activeConversation]);
  
  // Função de envio de mensagem com HTTP Request para o n8n
  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeConversation || !content.trim()) return;

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

    const optimisticId = `${activeConversation}-${Date.now()}`;
    const sentAt = new Date();
    
    // 1. Atualização Otimista da UI
    const newMessage: Message = {
      id: optimisticId,
      content: content,
      sender: 'user',
      timestamp: sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message_type: 'text',
      media_url: undefined,
      media_type: undefined,
      file_name: undefined,
      file_size: undefined,
      transcription: undefined,
      caption: undefined
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      // 2. Enviar para o webhook do n8n (REMOVIDO o insert no Supabase)
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-message`;

      if (!webhookUrl) {
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        return;
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          conversationId: activeConversation,
          text: content,
          userId,
          evolutionInstance: evolutionInstanceName,
          clientPhone,
          clientName,
          clientId
        })
      });

    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
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
      const sentAt = new Date();

      // 1. Atualização Otimista da UI
      const newMessage: Message = {
        id: optimisticId,
        content: '🎵 Áudio gravado',
        sender: 'user',
        timestamp: sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message_type: 'audio',
        media_url: undefined,
        media_type: 'audio/webm',
        file_name: fileName,
        file_size: audioBlob.size,
        transcription: undefined,
        caption: undefined
      };
      setMessages(prev => [...prev, newMessage]);

      // 2. Converter Blob para base64 de forma segura
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Converter para base64 usando uma abordagem mais segura
      let base64 = '';
      const chunkSize = 8192; // Processar em chunks para evitar stack overflow
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        // Usar uma abordagem mais segura para converter Uint8Array para string
        const chunkString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
        base64 += chunkString;
      }
      
      base64 = btoa(base64);

      // 3. Enviar para a função send-message
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-message`;

      if (!webhookUrl) {
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        return;
      }

      console.log('Enviando áudio...', {
        size: audioBlob.size,
        base64Length: base64.length,
        fileName
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          conversationId: activeConversation,
          audio: {
            base64: base64,
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
      console.log('Áudio enviado com sucesso:', result);

    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      // Remover mensagem otimista em caso de erro
      setMessages(prev => prev.filter(m => !m.id.includes('audio-')));
    }
  }, [activeConversation, user, evolutionInstance]);
  
  if (!activeConversation) {
    return <EmptyState />;
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
      <MessageInput onSendMessage={handleSendMessage} onSendAudio={handleSendAudio} />
    </div>
  );
};

export default ChatWindow;
