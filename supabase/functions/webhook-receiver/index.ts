import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🔥 [${requestId}] === WEBHOOK RECEIVER INICIADO ===`);
  console.log(`🔥 [${requestId}] Método: ${req.method}`);
  console.log(`🔥 [${requestId}] URL: ${req.url}`);
  console.log(`🔥 [${requestId}] Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔥 [${requestId}] CORS preflight - retornando OK`);
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`🔥 [${requestId}] Lendo body da requisição...`);
    const body = await req.json();
    console.log(`🔥 [${requestId}] Body lido com sucesso`);
    
    const { instance, data } = body;

    console.log(`🔥 [${requestId}] --- 🚀 Iniciando Webhook Receiver ---`);
    console.log(`🔥 [${requestId}] Instância recebida: ${instance}`);
    console.log(`🔥 [${requestId}] Dados presentes: ${data ? 'SIM' : 'NÃO'}`);
    
    // Não logar o body inteiro se contiver base64 (muito grande)
    if (data?.message?.imageMessage?.jpegThumbnail) {
        console.log(`🔥 [${requestId}] Payload recebido (imagem com thumbnail).`);
    } else {
        console.log(`🔥 [${requestId}] Payload completo:`, JSON.stringify(data, null, 2));
    }

    if (!data || !data.key || !data.key.remoteJid) {
      console.log(`🔥 [${requestId}] 🔚 Webhook sem dados essenciais (remoteJid). Ignorando.`);
      return new Response("ok - ignorado", { headers: corsHeaders });
    }

    const { key, pushName, message, messageTimestamp } = data;
    const fromMe = key.fromMe;
    const remoteJid = key.remoteJid;

    console.log(`🔥 [${requestId}] Key extraída:`, key);
    console.log(`🔥 [${requestId}] PushName: ${pushName}`);
    console.log(`🔥 [${requestId}] FromMe: ${fromMe}`);
    console.log(`🔥 [${requestId}] RemoteJid: ${remoteJid}`);
    console.log(`🔥 [${requestId}] MessageTimestamp: ${messageTimestamp}`);

    if (remoteJid.includes('@broadcast')) {
      console.log(`🔥 [${requestId}] 🔚 Mensagem de broadcast. Ignorando.`);
      return new Response("ok - broadcast ignorado", { headers: corsHeaders });
    }

    // 🐛 CORREÇÃO: Ignorar mensagens enviadas por mim para evitar duplicação
    if (fromMe) {
      console.log(`🔥 [${requestId}] ➡️ Mensagem enviada por mim (fromMe: true). Ignorando para evitar duplicação.`);
      return new Response("ok - mensagem própria ignorada", { headers: corsHeaders });
    }

    const clientPhone = remoteJid.split('@')[0];
    const clientName = fromMe ? 'Eu' : (pushName || 'Novo Contato');
    console.log(`🔥 [${requestId}] 💬 Mensagem ${fromMe ? 'de' : 'para'} ${clientName} (${clientPhone})`);

    console.log(`🔥 [${requestId}] Criando cliente Supabase...`);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    console.log(`🔥 [${requestId}] Cliente Supabase criado`);

    console.log(`🔥 [${requestId}] ⚙️ Buscando usuário para a instância: ${instance}`);

    console.log(`🔥 [${requestId}] Executando query na tabela settings...`);
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('user_id')
      .eq('evolution_instance_name', instance)
      .single();

    console.log(`🔥 [${requestId}] Resultado da query settings:`, { settings, settingsError });

    if (settingsError || !settings?.user_id) {
      console.error(`🔥 [${requestId}] ❌ Erro: Configurações ou user_id não encontrados para a instância ${instance}.`, settingsError);
      
      // Tentar buscar por instance_name como fallback
      console.log(`🔥 [${requestId}] Tentando fallback com instance_name...`);
      const { data: fallbackSettings, error: fallbackError } = await supabase
        .from('settings')
        .select('user_id')
        .eq('instance_name', instance)
        .single();
        
      console.log(`🔥 [${requestId}] Resultado do fallback:`, { fallbackSettings, fallbackError });
        
      if (fallbackError || !fallbackSettings?.user_id) {
        console.error(`🔥 [${requestId}] ❌ Erro: Configurações não encontradas nem como evolution_instance_name nem como instance_name para ${instance}.`);
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
      console.log(`🔥 [${requestId}] ✅ Usuário encontrado via fallback: ${settings.user_id}`);
    }
    
    const assignedUserId = settings.user_id;
    console.log(`🔥 [${requestId}] ✅ Usuário da instância: ${assignedUserId}`);

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

    // 🎯 Função para baixar mídia e fazer upload para Supabase Storage
    const downloadAndUploadMedia = async (url: string, fileName: string, mimeType: string, clientId: string) => {
      try {
        console.log(`📥 Baixando mídia de: ${url}`);
        
        // Baixar a mídia da Evolution API
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`❌ Erro ao baixar mídia: ${response.status} ${response.statusText}`);
          return null;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const extension = fileName.split('.').pop() || 'bin';
        const uniqueFileName = `${clientId}/${timestamp}_${fileName}`;
        
        console.log(`📤 Fazendo upload para Supabase Storage: ${uniqueFileName}`);
        
        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('whatsapp-media')
          .upload(uniqueFileName, uint8Array, {
            contentType: mimeType,
            upsert: true
          });
        
        if (uploadError) {
          console.error('❌ Erro no upload para Supabase Storage:', uploadError);
          return null;
        }
        
        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from('whatsapp-media')
          .getPublicUrl(uploadData.path);
        
        console.log(`✅ Mídia salva com sucesso: ${publicUrlData.publicUrl}`);
        return {
          publicUrl: publicUrlData.publicUrl,
          fileSize: uint8Array.length
        };
        
      } catch (error) {
        console.error('❌ Erro ao processar mídia:', error);
        return null;
      }
    };

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
        
        // 🔧 CORREÇÃO: Baixar e fazer re-upload da imagem
        if (message.imageMessage.url) {
          const mediaResult = await downloadAndUploadMedia(
            message.imageMessage.url, 
            file_name, 
            media_type, 
            client!.id
          );
          if (mediaResult) {
            media_url = mediaResult.publicUrl;
            file_size = mediaResult.fileSize;
          } else {
            // Fallback para URL original se o download falhar
            media_url = message.imageMessage.url;
          }
        }
    } else if (message?.audioMessage) {
        content = 'Áudio';
        message_type = 'audio';
        media_type = message.audioMessage.mimetype || 'audio/ogg';
        file_name = `audio_${messageTimestamp}.ogg`;
        
        // 🔧 CORREÇÃO: Baixar e fazer re-upload do áudio
        if (message.audioMessage.url) {
          const mediaResult = await downloadAndUploadMedia(
            message.audioMessage.url, 
            file_name, 
            media_type, 
            client!.id
          );
          if (mediaResult) {
            media_url = mediaResult.publicUrl;
            file_size = mediaResult.fileSize;
          } else {
            // Fallback para URL original se o download falhar
            media_url = message.audioMessage.url;
          }
        }
    } else if (message?.documentMessage) {
        content = message.documentMessage.caption || message.documentMessage.fileName || 'Documento';
        message_type = 'document';
        media_type = message.documentMessage.mimetype;
        file_name = message.documentMessage.fileName || `document_${messageTimestamp}`;
        
        // 🔧 CORREÇÃO: Baixar e fazer re-upload do documento
        if (message.documentMessage.url) {
          const mediaResult = await downloadAndUploadMedia(
            message.documentMessage.url, 
            file_name, 
            media_type, 
            client!.id
          );
          if (mediaResult) {
            media_url = mediaResult.publicUrl;
            file_size = mediaResult.fileSize;
          } else {
            // Fallback para URL original se o download falhar
            media_url = message.documentMessage.url;
          }
        }
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

    console.log(`🔥 [${requestId}] 💾 Inserindo mensagem no banco...`);
    console.log(`🔥 [${requestId}] Dados da mensagem:`, messageToInsert);
    
    const { error: msgError } = await supabase
      .from('messages')
      .insert(messageToInsert);

    if (msgError) {
      console.error(`🔥 [${requestId}] ❌ Erro ao inserir a mensagem no banco:`, msgError);
      throw msgError;
    }
    
    console.log(`🔥 [${requestId}] ✅ Mensagem inserida com sucesso!`);
    console.log(`🔥 [${requestId}] --- ✅ Webhook finalizado com sucesso ---`);
    console.log(`🔥 [${requestId}] Tempo total: ${Date.now() - startTime}ms`);

    return new Response("ok", { headers: corsHeaders });

  } catch (error) {
    console.error(`🔥 [${requestId}] 🔥 Erro fatal no processamento do webhook:`, error);
    console.error(`🔥 [${requestId}] Stack trace:`, error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message,
        requestId: requestId
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});