import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { instance, data } = body;

    console.log('--- 🚀 Iniciando Webhook Receiver ---');
    console.log(`Instância: ${instance}`);
    
    // Não logar o body inteiro se contiver base64 (muito grande)
    if (data?.message?.imageMessage?.jpegThumbnail) {
        console.log('Payload recebido (imagem com thumbnail).');
    } else {
        console.log('Payload completo:', JSON.stringify(data, null, 2));
    }

    if (!data || !data.key || !data.key.remoteJid) {
      console.log('🔚 Webhook sem dados essenciais (remoteJid). Ignorando.');
      return new Response("ok - ignorado", { headers: corsHeaders });
    }

    const { key, pushName, message, messageTimestamp } = data;
    const fromMe = key.fromMe;
    const remoteJid = key.remoteJid;

    if (remoteJid.includes('@broadcast')) {
      console.log('🔚 Mensagem de broadcast. Ignorando.');
      return new Response("ok - broadcast ignorado", { headers: corsHeaders });
    }

    const clientPhone = remoteJid.split('@')[0];
    const clientName = fromMe ? 'Eu' : (pushName || 'Novo Contato');
    console.log(`💬 Mensagem ${fromMe ? 'de' : 'para'} ${clientName} (${clientPhone})`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`⚙️ Buscando usuário para a instância: ${instance}`);
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('user_id')
      .eq('evolution_instance_name', instance)
      .single();

    if (settingsError || !settings?.user_id) {
      console.error(`❌ Erro: Configurações ou user_id não encontrados para a instância ${instance}.`, settingsError);
      
      // Tentar buscar por instance_name como fallback
      const { data: fallbackSettings, error: fallbackError } = await supabase
        .from('settings')
        .select('user_id')
        .eq('instance_name', instance)
        .single();
        
      if (fallbackError || !fallbackSettings?.user_id) {
        console.error(`❌ Erro: Configurações não encontradas nem como evolution_instance_name nem como instance_name para ${instance}.`);
        return new Response(
          JSON.stringify({ 
            error: `Configurações não encontradas para a instância ${instance}`,
            details: settingsError?.message || 'Instância não configurada'
          }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      settings.user_id = fallbackSettings.user_id;
      console.log(`✅ Usuário encontrado via fallback: ${settings.user_id}`);
    }
    
    const assignedUserId = settings.user_id;
    console.log(`✅ Usuário da instância: ${assignedUserId}`);

    console.log(`🔍 Buscando cliente pelo telefone: ${clientPhone}`);
    let { data: client } = await supabase
      .from('clients')
      .select('id, name')
      .eq('phone', clientPhone)
      .single();

    if (!client) {
      // Só cria cliente se a mensagem for RECEBIDA de um número novo.
      if (!fromMe) {
          // 🔧 CORREÇÃO: Melhorar lógica de nome do cliente
          const clientName = pushName && pushName.trim() && pushName !== clientPhone 
            ? pushName.trim() 
            : `Contato ${clientPhone}`;
            
          console.log(`🤔 Cliente não encontrado. Criando novo: Nome='${clientName}', Tel='${clientPhone}'`);
          const { data: newClient, error: newClientError } = await supabase
            .from('clients')
            .insert({ 
              name: clientName, 
              phone: clientPhone, 
              status: 'ativo', 
              created_by: assignedUserId 
            })
            .select('id, name')
            .single();
          
          if (newClientError) {
              console.error('❌ Erro ao criar novo cliente:', newClientError);
              throw newClientError;
          }
          client = newClient;
          console.log(`✅ Cliente criado com sucesso: ID=${client!.id}`);
      } else {
          console.log('➡️ Mensagem de saída para número não-cliente. Não criando cliente.');
          return new Response("ok - mensagem de saída para não-cliente", { headers: corsHeaders });
      }
    } else {
      console.log(`✅ Cliente existente encontrado: ${client.name} (ID=${client.id})`);
      
      // 🎯 OPCIONAL: Atualizar nome apenas se o atual for genérico e o pushName for melhor
      if (pushName && 
          pushName.trim() && 
          pushName !== clientPhone &&
          (client.name.startsWith('Contato ') || client.name === clientPhone)) {
        
        console.log(`🔄 Atualizando nome genérico "${client.name}" para "${pushName}"`);
        
        const { error: updateError } = await supabase
          .from('clients')
          .update({ name: pushName.trim() })
          .eq('id', client.id);
          
        if (!updateError) {
          client.name = pushName.trim();
          console.log('✅ Nome do cliente atualizado');
        }
      }
    }

    console.log(`🔄 Buscando conversa para o cliente ID: ${client!.id}`);
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', client!.id)
      .single();

    if (!conversation) {
      console.log(`🤔 Conversa não encontrada. Criando nova...`);
      const { data: newConv, error: newConvError } = await supabase
        .from('conversations')
        .insert({ 
          client_id: client!.id, 
          status: 'active', 
          assigned_to: assignedUserId 
        })
        .select('id')
        .single();

      if (newConvError) {
        console.error('❌ Erro ao criar nova conversa:', newConvError);
        throw newConvError;
      }
      conversation = newConv;
      console.log(`✅ Nova conversa criada: ID=${conversation!.id}`);
    } else {
      console.log(`✅ Conversa existente encontrada: ID=${conversation.id}`);
    }

    let content = 'Mídia recebida';
    let message_type = 'media';
    let media_url = null;
    let media_type = null;
    let file_name = null;
    let file_size = null;

    if (message?.conversation) {
        content = message.conversation;
        message_type = 'text';
    } else if (message?.extendedTextMessage?.text) {
        content = message.extendedTextMessage.text;
        message_type = 'text';
    } else if (message?.imageMessage) {
        content = message.imageMessage.caption || 'Imagem';
        message_type = 'image';
        media_type = message.imageMessage.mimetype || 'image/jpeg';
        file_name = `image_${messageTimestamp}.jpg`;
        media_url = message.imageMessage.url;
    } else if (message?.audioMessage) {
        content = 'Áudio';
        message_type = 'audio';
        media_type = message.audioMessage.mimetype || 'audio/ogg';
        file_name = `audio_${messageTimestamp}.ogg`;
        media_url = message.audioMessage.url;
    } else if (message?.documentMessage) {
        content = message.documentMessage.caption || message.documentMessage.fileName || 'Documento';
        message_type = 'document';
        media_type = message.documentMessage.mimetype;
        file_name = message.documentMessage.fileName;
        media_url = message.documentMessage.url;
    }

    const messageToInsert = {
      conversation_id: conversation.id,
      content: content,
      message_type: message_type,
      sender: fromMe ? 'user' : 'client',
      media_url: media_url,
      media_type: media_type,
      file_name: file_name,
      file_size: file_size,
      sent_at: new Date(messageTimestamp * 1000).toISOString(),
      user_id: assignedUserId,
      from_me: fromMe,
      message_id: key.id || `msg_${Date.now()}`,
      remote_jid: remoteJid,
      instance_name: instance,
      push_name: pushName,
      raw_data: data,
      read_at: fromMe ? new Date().toISOString() : null
    };

    console.log('💾 Inserindo mensagem no banco...', messageToInsert);
    const { error: msgError } = await supabase
      .from('messages')
      .insert(messageToInsert);

    if (msgError) {
      console.error('❌ Erro ao inserir a mensagem no banco:', msgError);
      throw msgError;
    }
    
    console.log('✅ Mensagem inserida com sucesso!');
    console.log('--- ✅ Webhook finalizado com sucesso ---');

    return new Response("ok", { headers: corsHeaders });

  } catch (error) {
    console.error('🔥 Erro fatal no processamento do webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});