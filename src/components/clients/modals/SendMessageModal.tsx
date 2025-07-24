import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { supabase } from '@/lib/supabase';
import { AvatarWithProfile } from '@/components/ui/avatar-with-profile';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess?: (conversationId: string) => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ 
  open, 
  onOpenChange, 
  client,
  onSuccess 
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useSupabase();

  const handleSendMessage = async () => {
    if (!client || !message.trim() || !user) return;

    setSending(true);
    
    try {
      console.log('🚀 Iniciando envio de mensagem para:', client.name);
      
      // 1. Buscar ou criar conversa usando a função RPC corrigida
      const { data: conversationId, error: conversationError } = await supabase
        .rpc('get_or_create_conversation_corrected', {
          p_client_id: client.id,
          p_assigned_to: user?.id || null
        });
    
      if (conversationError) {
        console.error('❌ Erro ao buscar/criar conversa:', conversationError);
        throw new Error('Erro ao buscar/criar conversa');
      }
    
      console.log('✅ Conversa ID:', conversationId);
    
      // 2. Buscar configurações do usuário para pegar a instância Evolution
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('evolution_instance_name')
        .eq('user_id', user.id)
        .maybeSingle();
    
      const evolutionInstanceName = settings?.evolution_instance_name || '';
      console.log('🔧 Instância Evolution:', evolutionInstanceName);
    
      // 3. Salvar mensagem no banco primeiro (atualização otimista)
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: message,
          sender: 'user',
          sent_at: new Date().toISOString(),
          message_type: 'text'
        });
    
      if (messageError) {
        console.error('❌ Erro ao salvar mensagem:', messageError);
        throw new Error('Erro ao salvar mensagem');
      }
    
      console.log('✅ Mensagem salva no banco');
    
      // 4. Enviar mensagem através do webhook
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-message`;
      
      if (webhookUrl) {
        try {
          console.log('📤 Enviando via webhook...');
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              conversationId,
              text: message,
              userId: user.id,
              evolutionInstance: evolutionInstanceName,
              clientPhone: client.phone,
              clientName: client.name,
              clientId: client.id
            })
          });
    
          if (!response.ok) {
            console.warn('⚠️ Webhook falhou, mas mensagem foi salva no banco');
          } else {
            console.log('✅ Mensagem enviada via webhook');
          }
        } catch (webhookError) {
          console.error('❌ Erro ao enviar via webhook:', webhookError);
          // Não falhar completamente se o webhook falhar
        }
      }
    
      // 5. Limpar formulário e fechar modal
      setMessage('');
      onOpenChange(false);
      
      // 6. Callback de sucesso com o ID da conversa
      if (onSuccess) {
        onSuccess(conversationId);
      }
    
      console.log('🎉 Envio de mensagem concluído com sucesso');
    
    } catch (error) {
      console.error('💥 Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-pharmacy-text1 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-pharmacy-accent" />
            Enviar Mensagem
          </DialogTitle>
          {client && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
              <AvatarWithProfile 
                contactNumber={client.phone}
                contactName={client.name}
                size="md"
              />
              <div className="flex-1">
                <p className="font-medium text-pharmacy-text1">{client.name}</p>
                <p className="text-sm text-pharmacy-text2">{client.phone}</p>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-pharmacy-text1">
              Mensagem
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="min-h-[120px] resize-none border-pharmacy-border1 focus:border-pharmacy-accent focus:ring-pharmacy-accent"
              disabled={sending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
            className="border-pharmacy-border1 text-pharmacy-text1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;