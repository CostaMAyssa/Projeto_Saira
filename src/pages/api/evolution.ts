import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Interface para eventos da Evolution API
interface EvolutionWebhookEvent {
  event: string;
  instance: string;
  data: any;
}

// 🔧 CORREÇÃO 8: Endpoint para receber eventos via webhook (fallback do WebSocket)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const event: EvolutionWebhookEvent = req.body;
    
    console.log('🔔 Webhook Evolution API recebido:', {
      event: event.event,
      instance: event.instance,
      timestamp: new Date().toISOString()
    });

    // Processar diferentes tipos de eventos
    switch (event.event) {
      case 'MESSAGES_UPSERT':
        await processMessageUpsert(event);
        break;
      
      case 'MESSAGES_UPDATE':
        await processMessageUpdate(event);
        break;
      
      case 'MESSAGES_DELETE':
        await processMessageDelete(event);
        break;
      
      case 'CONNECTION_UPDATE':
        await processConnectionUpdate(event);
        break;
      
      case 'QRCODE_UPDATED':
        await processQRCodeUpdate(event);
        break;
      
      default:
        console.log(`📝 Evento não processado: ${event.event}`);
    }

    // Armazenar evento no Supabase para debugging/logs
    await supabase
      .from('webhook_events')
      .insert([
        {
          event_type: event.event,
          instance_name: event.instance,
          data: event.data,
          processed_at: new Date().toISOString()
        }
      ]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Processar mensagens recebidas/enviadas
async function processMessageUpsert(event: EvolutionWebhookEvent) {
  const messages = event.data;
  
  if (!Array.isArray(messages)) return;

  for (const msg of messages) {
    try {
      // Extrair dados da mensagem
      const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      
      if (!content || !content.trim()) {
        console.log('⚠️ Mensagem sem conteúdo ignorada');
        continue;
      }

      const messageData = {
        message_id: msg.key?.id,
        conversation_id: `conv_${msg.key?.remoteJid}`, // Criar ID de conversa baseado no remoteJid
        remote_jid: msg.key?.remoteJid,
        from_me: msg.key?.fromMe || false,
        content: content,
        timestamp: new Date(msg.messageTimestamp * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        sent_at: new Date(msg.messageTimestamp * 1000).toISOString(),
        instance_name: event.instance,
        message_type: msg.messageType || 'text',
        push_name: msg.pushName || null,
        sender: msg.key?.fromMe ? 'user' : 'client', // Para compatibilidade com estrutura antiga
        raw_data: msg
      };

      // 🔧 CORREÇÃO: Salvar com estrutura unificada para WebSocket + Webhook
      await supabase
        .from('messages')
        .upsert([messageData], { onConflict: 'message_id' });

      console.log(`📨 Mensagem processada via webhook: ${messageData.from_me ? '📤' : '📥'} ${messageData.content.substring(0, 50)}...`);
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem individual:', error);
    }
  }
}

// Processar atualizações de mensagem (status de entrega)
async function processMessageUpdate(event: EvolutionWebhookEvent) {
  console.log('🔄 Processando atualização de mensagem:', event.data);
  
  // TODO: Implementar atualização de status de mensagens
  // Exemplo: delivered, read, etc.
}

// Processar exclusão de mensagens
async function processMessageDelete(event: EvolutionWebhookEvent) {
  console.log('🗑️ Processando exclusão de mensagem:', event.data);
  
  // TODO: Implementar exclusão de mensagens
}

// Processar mudanças de conexão
async function processConnectionUpdate(event: EvolutionWebhookEvent) {
  const connectionData = event.data;
  
  console.log('🔗 Processando atualização de conexão:', connectionData);
  
  // Atualizar status da instância no Supabase
  await supabase
    .from('instance_status')
    .upsert([
      {
        instance_name: event.instance,
        connection_state: connectionData.state,
        last_disconnect: connectionData.lastDisconnect,
        updated_at: new Date().toISOString()
      }
    ], { onConflict: 'instance_name' });
}

// Processar atualizações de QR Code
async function processQRCodeUpdate(event: EvolutionWebhookEvent) {
  const qrData = event.data;
  
  console.log('📱 Processando QR Code:', qrData);
  
  // Salvar QR Code no Supabase para exibição na UI
  await supabase
    .from('qr_codes')
    .upsert([
      {
        instance_name: event.instance,
        qr_code: qrData.qr,
        base64: qrData.base64,
        created_at: new Date().toISOString()
      }
    ], { onConflict: 'instance_name' });
} 