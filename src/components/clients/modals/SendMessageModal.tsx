import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { supabase } from '@/lib/supabase';

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
      // 1. Verificar se já existe uma conversa ativa com este cliente
      const { data: existingConversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', client.id)
        .eq('status', 'active')
        .eq('assigned_to', user.id)
        .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro quando não encontrar

      let conversationId = existingConversation?.id;

      // 2. Se não existe conversa, criar uma nova
      if (!conversationId) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_id: client.id,
            assigned_to: user.id,
            status: 'active',
            started_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Erro ao criar conversa:', createError);
          throw new Error('Erro ao criar conversa');
        }

        conversationId = newConversation.id;
      }

      // 3. Buscar configurações do usuário para pegar a instância Evolution
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('evolution_instance_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const evolutionInstanceName = settings?.evolution_instance_name || '';

      // 4. Salvar mensagem no banco primeiro (atualização otimista)
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: message,
          sender: 'user',
          sent_at: new Date().toISOString(),
          message_type: 'text'
        });

      // 5. Enviar mensagem através do webhook do n8n
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
        } catch (webhookError) {
          console.error('Erro ao enviar via webhook:', webhookError);
          // Não falhar completamente se o webhook falhar
        }
      }

      // 6. Limpar formulário e fechar modal
      setMessage('');
      onOpenChange(false);
      
      // 7. Callback de sucesso com o ID da conversa
      if (onSuccess) {
        onSuccess(conversationId);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Aqui você pode adicionar uma notificação de erro
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-pharmacy-text1 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-pharmacy-accent" />
            Enviar Mensagem
          </DialogTitle>
          {client && (
            <p className="text-sm text-pharmacy-text2 mt-1">
              Para: <span className="font-medium">{client.name}</span> ({client.phone})
            </p>
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