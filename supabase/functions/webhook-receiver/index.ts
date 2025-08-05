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
    
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phoneNumber)
      .single();

    if (clientError) {
      console.error(`🔥 [${requestId}] ❌ Erro ao buscar cliente:`, clientError);
      
      if (clientError.code === 'PGRST116') {
        console.log(`🔥 [${requestId}] 👤 Cliente não encontrado, criando novo...`);
        
        // Criar novo cliente
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            phone: phoneNumber,
            name: pushName || 'Cliente WhatsApp',
            email: null,
            created_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (createError) {
          console.error(`🔥 [${requestId}] ❌ Erro ao criar cliente:`, createError);
          throw createError;
        }

        console.log(`🔥 [${requestId}] ✅ Novo cliente criado:`, JSON.stringify(newClient, null, 2));
        
        // Usar o novo cliente
        const client = newClient;
        
        // 💬 Buscar ou criar conversa
        console.log(`🔥 [${requestId}] 🔍 Buscando conversa para cliente: ${client.id}`);
        
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('client_id', client.id)
          .single();

        if (conversationError) {
          console.error(`🔥 [${requestId}] ❌ Erro ao buscar conversa:`, conversationError);
          
          if (conversationError.code === 'PGRST116') {
            console.log(`🔥 [${requestId}] 💬 Conversa não encontrada, criando nova...`);
            
            // Criar nova conversa
            const { data: newConversation, error: createConvError } = await supabase
              .from('conversations')
              .insert({
                client_id: client.id,
                status: 'active',
                started_at: new Date().toISOString(),
                last_message_at: new Date().toISOString()
              })
              .select('*')
              .single();

            if (createConvError) {
              console.error(`🔥 [${requestId}] ❌ Erro ao criar conversa:`, createConvError);
              throw createConvError;
            }

            console.log(`🔥 [${requestId}] ✅ Nova conversa criada:`, JSON.stringify(newConversation, null, 2));
            
            // Processar mensagem
            await processMessage(requestId, newConversation, client, messageData, data, supabase);
          } else {
            throw conversationError;
          }
        } else {
          console.log(`🔥 [${requestId}] ✅ Conversa encontrada:`, JSON.stringify(conversation, null, 2));
          
          // Atualizar last_message_at
          await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversation.id);
            
          // Processar mensagem
          await processMessage(requestId, conversation, client, messageData, data, supabase);
        }
      } else {
        throw clientError;
      }
    } else {
      console.log(`🔥 [${requestId}] ✅ Cliente encontrado:`, JSON.stringify(client, null, 2));
      
      // 💬 Buscar ou criar conversa
      console.log(`🔥 [${requestId}] 🔍 Buscando conversa para cliente: ${client.id}`);
      
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', client.id)
        .single();

      if (conversationError) {
        console.error(`🔥 [${requestId}] ❌ Erro ao buscar conversa:`, conversationError);
        
        if (conversationError.code === 'PGRST116') {
          console.log(`🔥 [${requestId}] 💬 Conversa não encontrada, criando nova...`);
          
          // Criar nova conversa
          const { data: newConversation, error: createConvError } = await supabase
            .from('conversations')
            .insert({
              client_id: client.id,
              status: 'active',
              started_at: new Date().toISOString(),
              last_message_at: new Date().toISOString()
            })
            .select('*')
            .single();

          if (createConvError) {
            console.error(`🔥 [${requestId}] ❌ Erro ao criar conversa:`, createConvError);
            throw createConvError;
          }

          console.log(`🔥 [${requestId}] ✅ Nova conversa criada:`, JSON.stringify(newConversation, null, 2));
          
          // Processar mensagem
          await processMessage(requestId, newConversation, client, messageData, data, supabase);
        } else {
          throw conversationError;
        }
      } else {
        console.log(`🔥 [${requestId}] ✅ Conversa encontrada:`, JSON.stringify(conversation, null, 2));
        
        // Atualizar last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);
          
        // Processar mensagem
        await processMessage(requestId, conversation, client, messageData, data, supabase);
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

// Função para processar mensagem
async function processMessage(requestId: string, conversation: any, client: any, messageData: any, data: any, supabase: any) {
  const { key, message, messageTimestamp, pushName } = messageData;
  const { remoteJid, fromMe } = key;
  const phoneNumber = remoteJid.replace('@s.whatsapp.net', '');
  const instance = data.instance; // Extrair instance dos dados

  // 📝 Processar conteúdo da mensagem
  let content = '';
  let message_type = 'text';
  let media_url: string | null = null;
  let media_type: string | null = null;
  let file_name: string | null = null;
  let file_size: number | null = null;

  console.log(`🔥 [${requestId}] 🔍 Processando tipo de mensagem...`);

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
      content = message.imageMessage.caption || 'Imagem';
      message_type = 'image';
      media_type = message.imageMessage.mimetype || 'image/jpeg';
      file_name = `image_${messageTimestamp}.jpg`;
      
      if (message.imageMessage.url) {
        console.log(`🔥 [${requestId}] 🖼️ Processando imagem: ${message.imageMessage.url}`);
        const mediaResult = await downloadAndUploadMedia(
          message.imageMessage.url, 
          file_name!, 
          media_type!, 
          client.id
        );
        if (mediaResult) {
          media_url = mediaResult.publicUrl;
          file_size = mediaResult.fileSize;
          console.log(`🔥 [${requestId}] 🖼️ ✅ Imagem processada: ${media_url}`);
        } else {
          console.log(`🔥 [${requestId}] 🖼️ ⚠️ Falha ao processar imagem, usando URL original`);
          media_url = message.imageMessage.url;
        }
      }
  } else if (message?.audioMessage) {
      console.log(`🔥 [${requestId}] 🎵 Mensagem de áudio detectada`);
      content = 'Áudio';
      message_type = 'audio';
      media_type = message.audioMessage.mimetype || 'audio/ogg';
      file_name = `audio_${messageTimestamp}.ogg`;
      
      if (message.audioMessage.url) {
        console.log(`🔥 [${requestId}] 🎵 Processando áudio: ${message.audioMessage.url}`);
        const mediaResult = await downloadAndUploadMedia(
          message.audioMessage.url, 
          file_name!, 
          media_type!, 
          client.id
        );
        if (mediaResult) {
          media_url = mediaResult.publicUrl;
          file_size = mediaResult.fileSize;
          console.log(`🔥 [${requestId}] 🎵 ✅ Áudio processado: ${media_url}`);
        } else {
          console.log(`🔥 [${requestId}] 🎵 ⚠️ Falha ao processar áudio, usando URL original`);
          media_url = message.audioMessage.url;
        }
      }
  } else if (message?.documentMessage) {
      console.log(`🔥 [${requestId}] 📄 Mensagem de documento detectada`);
      content = message.documentMessage.caption || message.documentMessage.fileName || 'Documento';
      message_type = 'document';
      media_type = message.documentMessage.mimetype || 'application/octet-stream';
      file_name = message.documentMessage.fileName || `document_${messageTimestamp}`;
      
      if (message.documentMessage.url) {
        console.log(`🔥 [${requestId}] 📄 Processando documento: ${message.documentMessage.url}`);
        const mediaResult = await downloadAndUploadMedia(
          message.documentMessage.url, 
          file_name!, 
          media_type!, 
          client.id
        );
        if (mediaResult) {
          media_url = mediaResult.publicUrl;
          file_size = mediaResult.fileSize;
          console.log(`🔥 [${requestId}] 📄 ✅ Documento processado: ${media_url}`);
        } else {
          console.log(`🔥 [${requestId}] 📄 ⚠️ Falha ao processar documento, usando URL original`);
          media_url = message.documentMessage.url;
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
    user_id: null,
    from_me: fromMe,
    message_id: key.id || `msg_${Date.now()}`,
    remote_jid: remoteJid,
    instance_name: instance,
    push_name: pushName,
    raw_data: data,
    read_at: fromMe ? new Date().toISOString() : null
  };

  console.log(`🔥 [${requestId}] 💾 Inserindo mensagem no banco...`);
  console.log(`🔥 [${requestId}] 📊 Dados da mensagem:`, {
    conversation_id: conversation.id,
    content: content,
    message_type: message_type,
    sender: fromMe ? 'user' : 'client',
    media_url: media_url,
    media_type: media_type,
    file_name: file_name,
    file_size: file_size,
    message_id: key.id || `msg_${Date.now()}`
  });
  
  // 🔍 Verificar se já existe uma mensagem com o mesmo message_id
  const { data: existingMessage, error: checkError } = await supabase
    .from('messages')
    .select('id')
    .eq('message_id', messageToInsert.message_id)
    .eq('conversation_id', conversation.id)
    .single();

  if (existingMessage) {
    console.log(`🔥 [${requestId}] ⚠️ Mensagem já existe no banco:`, existingMessage.id);
    console.log(`🔥 [${requestId}] ⚠️ Message ID: ${messageToInsert.message_id}`);
    console.log(`🔥 [${requestId}] ⚠️ Ignorando inserção duplicada`);
    
    return;
  }
  
  const { data: insertedMessage, error: msgError } = await supabase
    .from('messages')
    .insert(messageToInsert)
    .select('*')
    .single();

  if (msgError) {
    console.error(`🔥 [${requestId}] ❌ Erro ao inserir a mensagem no banco:`, msgError);
    throw msgError;
  }
  
  console.log(`🔥 [${requestId}] ✅ Mensagem inserida com sucesso!`);
  console.log(`🔥 [${requestId}] 📊 Mensagem inserida:`, {
    id: insertedMessage.id,
    content: insertedMessage.content,
    message_type: insertedMessage.message_type,
    media_url: insertedMessage.media_url,
    media_type: insertedMessage.media_type,
    file_name: insertedMessage.file_name,
    file_size: insertedMessage.file_size
  });
}

// Função para baixar e fazer re-upload de mídia
const downloadAndUploadMedia = async (url: string, fileName: string, mimeType: string, clientId: string) => {
  try {
    console.log(`📥 Baixando mídia de: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ Erro ao baixar mídia: ${response.status} ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log(`✅ Mídia baixada com sucesso: ${uint8Array.length} bytes`);
    
    // Fazer upload para o Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Sanitizar nome do arquivo
    const sanitizeFileName = (name: string) => {
      return name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^a-zA-Z0-9.\-_]/g, '_') // só letras, números, ponto, hífen, underscore
        .replace(/\s+/g, '_') // espaços por underscore
        .replace(/_+/g, '_') // múltiplos underscores por um só
        .toLowerCase();
    };

    const sanitizedFileName = sanitizeFileName(fileName);
    const storagePath = `${clientId}/${Date.now()}_${sanitizedFileName}`;

    const { data, error } = await supabase.storage
      .from('whatsapp-media')
      .upload(storagePath, uint8Array, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error(`❌ Erro ao fazer upload da mídia:`, error);
      return null;
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from('whatsapp-media')
      .getPublicUrl(storagePath);

    console.log(`✅ Mídia enviada com sucesso: ${urlData.publicUrl}`);
    
    return {
      publicUrl: urlData.publicUrl,
      fileSize: uint8Array.length
    };
  } catch (error) {
    console.error(`❌ Erro ao processar mídia:`, error);
    return null;
  }
};