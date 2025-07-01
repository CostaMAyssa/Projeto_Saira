import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './chat-window/ChatHeader';
import MessageList from './chat-window/MessageList';
import MessageInput from './chat-window/MessageInput';
import EmptyState from './chat-window/EmptyState';
import { Message } from './types';
import { supabase } from '@/lib/supabase';

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
  isMobile
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageIds, setMessageIds] = useState<Set<string>>(new Set());
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected');
  
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
            sender: msg.from_me ? 'pharmacy' : 'client',
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
          sender: msg.from_me ? 'pharmacy' : 'client',
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

    const optimisticId = `${activeConversation}-${Date.now()}`;
    const sentAt = new Date();
    
    // 1. Atualização Otimista da UI
    const newMessage: Message = {
      id: optimisticId,
      content: content,
      sender: 'pharmacy',
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
      // 2. Salvar mensagem no Supabase
      const { error: supabaseError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversation,
          content: content,
          sender: 'user', // 'user' representa a farmácia/sistema
          sent_at: sentAt.toISOString()
        });
        
      if (supabaseError) {
        // Se a inserção no Supabase falhar, idealmente removeríamos a mensagem otimista
        console.error('Erro ao salvar mensagem no Supabase:', supabaseError);
        // Opcional: Lógica para remover a mensagem da UI ou marcar como "não enviada"
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        return; 
      }

      // 3. Enviar para o webhook do n8n
      // A URL agora é lida de uma variável de ambiente
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        console.error('A URL do webhook do n8n (VITE_N8N_WEBHOOK_URL) não está configurada.');
        // Opcional: Tratar o erro na UI
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        return;
      }

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation,
          text: content
        })
      });

    } catch (error) {
      console.error('Erro no processo de envio da mensagem:', error);
      // Opcional: Lógica para tratar falha de rede ou no n8n
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    }
  }, [activeConversation]);
  
  if (!activeConversation) {
    return <EmptyState />;
  }
  
  return (
    <div className="h-full flex flex-col bg-white relative font-sans">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-cover bg-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=')]"></div>
      <ChatHeader 
        activeConversation={activeConversation}
        onBackClick={onBackClick}
        isMobile={isMobile}
        realtimeStatus={realtimeStatus}
      />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
