import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Função para log estruturado
function logMessage(requestId: string, level: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    requestId,
    level,
    message,
    data
  };
  
  console.log(`🔥 [${requestId}] [${level}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  
  // Log estruturado para facilitar parsing
  console.log(`WEBHOOK_LOG: ${JSON.stringify(logEntry)}`);
}

serve(async (req) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  logMessage(requestId, 'INFO', '=== INÍCIO DO WEBHOOK ===', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    logMessage(requestId, 'INFO', 'Respondendo OPTIONS com CORS');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 🔧 Criar cliente Supabase
    const supabase = createClient(
      // @ts-expect-error - Deno global is available in Edge Runtime
      Deno.env.get('SUPABASE_URL')!,
      // @ts-expect-error - Deno global is available in Edge Runtime  
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    logMessage(requestId, 'INFO', 'Cliente Supabase criado com sucesso');

    // 📥 Receber e validar o payload
    const rawBody = await req.text();
    logMessage(requestId, 'INFO', `Payload recebido`, {
      size: rawBody.length,
      preview: rawBody.substring(0, 500)
    });
    
    if (!rawBody || rawBody.trim() === '') {
      logMessage(requestId, 'ERROR', 'Payload vazio ou undefined');
      return new Response(
        JSON.stringify({ error: 'Payload vazio', requestId: requestId }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let data;
    try {
      data = JSON.parse(rawBody);
      console.log(`🔥 [${requestId}] ✅ JSON parseado com sucesso`);
      console.log(`🔥 [${requestId}] 📊 Estrutura do payload:`, JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error(`🔥 [${requestId}] ❌ Erro ao fazer parse do JSON:`, parseError);
      console.error(`🔥 [${requestId}] Payload problemático:`, rawBody);
      return new Response(
        JSON.stringify({ 
          error: 'JSON inválido', 
          details: parseError.message,
          payload: rawBody.substring(0, 500),
          requestId: requestId 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 🔍 Validação detalhada da estrutura do payload
    console.log(`🔥 [${requestId}] 🔍 Validando estrutura do payload...`);
    
    if (!data.data) {
      console.error(`🔥 [${requestId}] ❌ Campo 'data' não encontrado no payload`);
      console.error(`🔥 [${requestId}] Campos disponíveis:`, Object.keys(data));
      return new Response(
        JSON.stringify({ 
          error: 'Campo data não encontrado', 
          availableFields: Object.keys(data),
          requestId: requestId 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { instance, data: messageData } = data;
    console.log(`🔥 [${requestId}] 📱 Instância: ${instance}`);
    console.log(`🔥 [${requestId}] 📨 Dados da mensagem:`, JSON.stringify(messageData, null, 2));

    if (!instance) {
      console.error(`🔥 [${requestId}] ❌ Campo 'instance' não encontrado`);
      return new Response(
        JSON.stringify({ error: 'Instance não encontrada', requestId: requestId }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!messageData) {
      console.error(`🔥 [${requestId}] ❌ messageData é null/undefined`);
      return new Response(
        JSON.stringify({ error: 'messageData não encontrado', requestId: requestId }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 🔍 Extrair informações da mensagem com logs detalhados
    const { key, message, messageTimestamp, pushName } = messageData;
    
    console.log(`🔥 [${requestId}] 🔑 Key:`, JSON.stringify(key, null, 2));
    console.log(`🔥 [${requestId}] 💬 Message:`, JSON.stringify(message, null, 2));
    console.log(`🔥 [${requestId}] ⏰ Timestamp: ${messageTimestamp}`);
    console.log(`🔥 [${requestId}] 👤 Push Name: ${pushName}`);

    if (!key) {
      console.error(`🔥 [${requestId}] ❌ Campo 'key' não encontrado na mensagem`);
      return new Response(
        JSON.stringify({ error: 'Key não encontrada', requestId: requestId }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { remoteJid, fromMe } = key;
    console.log(`🔥 [${requestId}] 📞 Remote JID: ${remoteJid}`);
    console.log(`🔥 [${requestId}] 📤 From Me: ${fromMe}`);

    if (!remoteJid) {
      console.error(`🔥 [${requestId}] ❌ remoteJid não encontrado na key`);
      console.error(`🔥 [${requestId}] Key completa:`, JSON.stringify(key, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'remoteJid não encontrado', 
          key: key,
          requestId: requestId 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 🔍 Verificação específica para o número problemático
    const phoneNumber = remoteJid.replace('@s.whatsapp.net', '');
    console.log(`🔥 [${requestId}] 📱 Número extraído: ${phoneNumber}`);
    
    if (phoneNumber === '556492019427') {
      console.log(`🔥 [${requestId}] 🎯 NÚMERO ALVO DETECTADO: 556492019427`);
      console.log(`🔥 [${requestId}] 🎯 Payload completo para análise:`, JSON.stringify(data, null, 2));
      console.log(`🔥 [${requestId}] 🎯 Message data completo:`, JSON.stringify(messageData, null, 2));
    }

    // 🏢 Buscar cliente
    console.log(`🔥 [${requestId}] 🔍 Buscando cliente com phone: ${phoneNumber}`);
    
    let { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phoneNumber)
      .single();

    if (clientError) {
      console.error(`🔥 [${requestId}] ❌ Erro ao buscar cliente:`, clientError);
      
      if (clientError.code === 'PGRST116') {
        console.log(`🔥 [${requestId}] 👤 Cliente não encontrado, criando novo...`);
        
        const { data: newClient, error: newClientError } = await supabase
          .from('clients')
          .insert({
            name: pushName || phoneNumber,
            phone: phoneNumber,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newClientError) {
          console.error(`🔥 [${requestId}] ❌ Erro ao criar novo cliente:`, newClientError);
          throw newClientError;
        }
        
        console.log(`🔥 [${requestId}] ✅ Novo cliente criado:`, newClient);
        client = newClient;
      } else {
        throw clientError;
      }
    } else {
      console.log(`🔥 [${requestId}] ✅ Cliente encontrado:`, client);
    }

    // 🔍 Verificação específica para o cliente problemático
    if (client && phoneNumber === '556492019427') {
      console.log(`🔥 [${requestId}] 🎯 CLIENTE ALVO ENCONTRADO/CRIADO:`, JSON.stringify(client, null, 2));
    }

    // 💬 Buscar ou criar conversa
    console.log(`🔥 [${requestId}] 💬 Buscando conversa existente...`);
    
    let { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', client!.id)
      .single();

    if (convError && convError.code === 'PGRST116') {
      console.log(`🔥 [${requestId}] 💬 Conversa não encontrada, criando nova...`);
      
      const { data: newConv, error: newConvError } = await supabase
        .from('conversations')
        .insert({
          client_id: client!.id,
          instance_name: instance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (newConvError) {
        console.error(`🔥 [${requestId}] ❌ Erro ao criar nova conversa:`, newConvError);
        throw newConvError;
      }
      conversation = newConv;
      console.log(`🔥 [${requestId}] ✅ Nova conversa criada: ID=${conversation!.id}`);
    } else if (convError) {
      console.error(`🔥 [${requestId}] ❌ Erro ao buscar conversa:`, convError);
      throw convError;
    } else {
      console.log(`🔥 [${requestId}] ✅ Conversa existente encontrada: ID=${conversation.id}`);
    }

    // 🔍 Verificação específica para a conversa do cliente problemático
    if (conversation && phoneNumber === '556492019427') {
      console.log(`🔥 [${requestId}] 🎯 CONVERSA ALVO ENCONTRADA/CRIADA:`, JSON.stringify(conversation, null, 2));
    }

    // 🎯 Função para baixar mídia e fazer upload para Supabase Storage
    const downloadAndUploadMedia = async (url: string, fileName: string, mimeType: string, clientId: string) => {
      try {
        console.log(`🔥 [${requestId}] 📥 Baixando mídia de: ${url}`);
        
        // Baixar a mídia da Evolution API
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`🔥 [${requestId}] ❌ Erro ao baixar mídia: ${response.status} ${response.statusText}`);
          return null;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const extension = fileName.split('.').pop() || 'bin';
        const uniqueFileName = `${clientId}/${timestamp}_${fileName}`;
        
        console.log(`🔥 [${requestId}] 📤 Fazendo upload para Supabase Storage: ${uniqueFileName}`);
        
        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('whatsapp-media')
          .upload(uniqueFileName, uint8Array, {
            contentType: mimeType,
            upsert: true
          });
        
        if (uploadError) {
          console.error(`🔥 [${requestId}] ❌ Erro no upload para Supabase Storage:`, uploadError);
          return null;
        }
        
        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from('whatsapp-media')
          .getPublicUrl(uploadData.path);
        
        console.log(`🔥 [${requestId}] ✅ Mídia salva com sucesso: ${publicUrlData.publicUrl}`);
        return {
          publicUrl: publicUrlData.publicUrl,
          fileSize: uint8Array.length
        };
        
      } catch (error) {
        console.error(`🔥 [${requestId}] ❌ Erro ao processar mídia:`, error);
        return null;
      }
    };

    // 📝 Processar conteúdo da mensagem com logs detalhados
    console.log(`🔥 [${requestId}] 📝 Processando conteúdo da mensagem...`);
    console.log(`🔥 [${requestId}] 📝 Tipos de mensagem disponíveis:`, Object.keys(message || {}));

    let content = 'Mídia recebida';
    let message_type = 'media';
    let media_url: string | null = null;
    let media_type: string | null = null;
    let file_name: string | null = null;
    let file_size: number | null = null;

    if (message?.conversation) {
        console.log(`🔥 [${requestId}] 💬 Mensagem de texto simples detectada`);
        content = message.conversation;
        message_type = 'text';
        console.log(`🔥 [${requestId}] 💬 Conteúdo: ${content}`);
    } else if (message?.extendedTextMessage?.text) {
        console.log(`🔥 [${requestId}] 💬 Mensagem de texto estendida detectada`);
        content = message.extendedTextMessage.text;
        message_type = 'text';
        console.log(`🔥 [${requestId}] 💬 Conteúdo: ${content}`);
    } else if (message?.imageMessage) {
        console.log(`🔥 [${requestId}] 🖼️ Mensagem de imagem detectada`);
        console.log(`🔥 [${requestId}] 🖼️ Dados da imagem:`, JSON.stringify(message.imageMessage, null, 2));
        
        content = message.imageMessage.caption || 'Imagem';
        message_type = 'image';
        media_type = message.imageMessage.mimetype || 'image/jpeg';
        file_name = `image_${messageTimestamp}.jpg`;
        
        console.log(`🔥 [${requestId}] 🖼️ Caption: ${content}`);
        console.log(`🔥 [${requestId}] 🖼️ MIME Type: ${media_type}`);
        console.log(`🔥 [${requestId}] 🖼️ URL original: ${message.imageMessage.url}`);
        
        // 🔧 CORREÇÃO: Baixar e fazer re-upload da imagem
        if (message.imageMessage.url) {
          console.log(`🔥 [${requestId}] 🖼️ Iniciando download e re-upload da imagem...`);
          const mediaResult = await downloadAndUploadMedia(
            message.imageMessage.url, 
            file_name!, 
            media_type!, 
            client!.id
          );
          if (mediaResult) {
            media_url = mediaResult.publicUrl;
            file_size = mediaResult.fileSize;
            console.log(`🔥 [${requestId}] 🖼️ ✅ Imagem processada com sucesso: ${media_url}`);
          } else {
            // Fallback para URL original se o download falhar
            media_url = message.imageMessage.url;
            console.log(`🔥 [${requestId}] 🖼️ ⚠️ Usando URL original como fallback: ${media_url}`);
          }
        } else {
          console.log(`🔥 [${requestId}] 🖼️ ❌ URL da imagem não encontrada`);
        }
    } else if (message?.audioMessage) {
        console.log(`🔥 [${requestId}] 🎵 Mensagem de áudio detectada`);
        console.log(`🔥 [${requestId}] 🎵 Dados do áudio:`, JSON.stringify(message.audioMessage, null, 2));
        
        content = 'Áudio';
        message_type = 'audio';
        media_type = message.audioMessage.mimetype || 'audio/ogg';
        file_name = `audio_${messageTimestamp}.ogg`;
        
        // 🔧 CORREÇÃO: Baixar e fazer re-upload do áudio
        if (message.audioMessage.url) {
          console.log(`🔥 [${requestId}] 🎵 Iniciando download e re-upload do áudio...`);
          const mediaResult = await downloadAndUploadMedia(
            message.audioMessage.url, 
            file_name!, 
            media_type!, 
            client!.id
          );
          if (mediaResult) {
            media_url = mediaResult.publicUrl;
            file_size = mediaResult.fileSize;
            console.log(`🔥 [${requestId}] 🎵 ✅ Áudio processado com sucesso: ${media_url}`);
          } else {
            // Fallback para URL original se o download falhar
            media_url = message.audioMessage.url;
            console.log(`🔥 [${requestId}] 🎵 ⚠️ Usando URL original como fallback: ${media_url}`);
          }
        }
    } else if (message?.documentMessage) {
        console.log(`🔥 [${requestId}] 📄 Mensagem de documento detectada`);
        console.log(`🔥 [${requestId}] 📄 Dados do documento:`, JSON.stringify(message.documentMessage, null, 2));
        
        content = message.documentMessage.caption || message.documentMessage.fileName || 'Documento';
        message_type = 'document';
        media_type = message.documentMessage.mimetype;
        file_name = message.documentMessage.fileName || `document_${messageTimestamp}`;
        
        // 🔧 CORREÇÃO: Baixar e fazer re-upload do documento
        if (message.documentMessage.url) {
          console.log(`🔥 [${requestId}] 📄 Iniciando download e re-upload do documento...`);
          const mediaResult = await downloadAndUploadMedia(
            message.documentMessage.url, 
            file_name!, 
            media_type!, 
            client!.id
          );
          if (mediaResult) {
            media_url = mediaResult.publicUrl;
            file_size = mediaResult.fileSize;
            console.log(`🔥 [${requestId}] 📄 ✅ Documento processado com sucesso: ${media_url}`);
          } else {
            // Fallback para URL original se o download falhar
            media_url = message.documentMessage.url;
            console.log(`🔥 [${requestId}] 📄 ⚠️ Usando URL original como fallback: ${media_url}`);
          }
        }
    } else {
        console.log(`🔥 [${requestId}] ❓ Tipo de mensagem não reconhecido`);
        console.log(`🔥 [${requestId}] ❓ Estrutura da mensagem:`, JSON.stringify(message, null, 2));
    }

    // 📦 Preparar dados para inserção
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
      user_id: null, // Removido assignedUserId, usando null por enquanto
      from_me: fromMe,
      message_id: key.id || `msg_${Date.now()}`,
      remote_jid: remoteJid,
      instance_name: instance,
      push_name: pushName,
      raw_data: data,
      read_at: fromMe ? new Date().toISOString() : null
    };

    console.log(`🔥 [${requestId}] 💾 Inserindo mensagem no banco...`);
    console.log(`🔥 [${requestId}] 💾 Dados da mensagem para inserção:`, JSON.stringify(messageToInsert, null, 2));
    
    // 🔍 Verificação específica antes da inserção para o número problemático
    if (phoneNumber === '556492019427') {
      console.log(`🔥 [${requestId}] 🎯 INSERINDO MENSAGEM DO NÚMERO ALVO 556492019427`);
      console.log(`🔥 [${requestId}] 🎯 Conversation ID: ${conversation.id}`);
      console.log(`🔥 [${requestId}] 🎯 Client ID: ${client!.id}`);
      console.log(`🔥 [${requestId}] 🎯 Message Type: ${message_type}`);
      console.log(`🔥 [${requestId}] 🎯 Content: ${content}`);
      console.log(`🔥 [${requestId}] 🎯 Media URL: ${media_url}`);
    }
    
    const { data: insertedMessage, error: msgError } = await supabase
      .from('messages')
      .insert(messageToInsert)
      .select('*')
      .single();

    if (msgError) {
      console.error(`🔥 [${requestId}] ❌ Erro ao inserir a mensagem no banco:`, msgError);
      console.error(`🔥 [${requestId}] ❌ Dados que causaram o erro:`, JSON.stringify(messageToInsert, null, 2));
      throw msgError;
    }
    
    console.log(`🔥 [${requestId}] ✅ Mensagem inserida com sucesso!`);
    console.log(`🔥 [${requestId}] ✅ Mensagem inserida:`, JSON.stringify(insertedMessage, null, 2));
    
    // 🔍 Verificação específica após inserção para o número problemático
    if (phoneNumber === '556492019427') {
      console.log(`🔥 [${requestId}] 🎯 ✅ MENSAGEM DO NÚMERO ALVO INSERIDA COM SUCESSO!`);
      console.log(`🔥 [${requestId}] 🎯 ✅ ID da mensagem inserida: ${insertedMessage.id}`);
      
      // Verificar se a mensagem realmente foi salva
      const { data: verifyMessage, error: verifyError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', insertedMessage.id)
        .single();
        
      if (verifyError) {
        console.error(`🔥 [${requestId}] 🎯 ❌ Erro ao verificar mensagem inserida:`, verifyError);
      } else {
        console.log(`🔥 [${requestId}] 🎯 ✅ Verificação: mensagem encontrada no banco:`, JSON.stringify(verifyMessage, null, 2));
      }
    }
    
    console.log(`🔥 [${requestId}] --- ✅ Webhook finalizado com sucesso ---`);
    console.log(`🔥 [${requestId}] Tempo total: ${Date.now() - startTime}ms`);

    return new Response("ok", { headers: corsHeaders });

  } catch (error) {
    console.error(`🔥 [${requestId}] 🔥 Erro fatal no processamento do webhook:`, error);
    console.error(`🔥 [${requestId}] 🔥 Stack trace:`, error.stack);
    console.error(`🔥 [${requestId}] 🔥 Erro detalhado:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message,
        stack: error.stack,
        requestId: requestId
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});