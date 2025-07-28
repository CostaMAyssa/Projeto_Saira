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
      
      // 1. Buscar ou criar conversa usando a mesma lógica do webhook-receiver
      console.log(`🔄 Buscando conversa para o cliente ID: ${client.id}`);
      let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', client.id)
        .single();

      if (!conversation) {
        console.log(`🤔 Conversa não encontrada. Criando nova...`);
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert({ 
            client_id: client.id, 
            status: 'active', 
            assigned_to: user.id 
          })
          .select('id')
          .single();

        if (newConvError) {
          console.error('❌ Erro ao criar nova conversa:', newConvError);
          throw new Error('Erro ao criar nova conversa');
        }
        conversation = newConv;
        console.log(`✅ Nova conversa criada: ID=${conversation!.id}`);
      } else {
        console.log(`✅ Conversa existente encontrada: ID=${conversation.id}`);
      }

      const conversationId = conversation.id;
    
      // 2. Buscar configurações do usuário para pegar a instância Evolution
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('evolution_instance_name')
        .eq('user_id', user.id)
        .maybeSingle();
    
      const evolutionInstanceName = settings?.evolution_instance_name || '';
      console.log('🔧 Instância Evolution:', evolutionInstanceName);
    
      // 3. Enviar mensagem usando a mesma lógica do ChatWindow
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-message`;
      
      if (!webhookUrl) {
        console.error("URL da função 'send-message' não configurada.");
        throw new Error("URL da função 'send-message' não configurada.");
      }

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
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta do webhook:', errorData);
        throw new Error(`Erro ao enviar mensagem: ${response.status}`);
      }

      console.log('✅ Mensagem enviada via webhook');
    
      // 4. Limpar formulário e fechar modal
      setMessage('');
      onOpenChange(false);
      
      // 5. Callback de sucesso com o ID da conversa
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