import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Tipos para clareza
interface Client {
  id: string;
  phone: string;
  name: string;
}

interface Conversation {
  id: string;
  client_id: string;
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // Webhooks da Evolution API não enviam autenticação
  // Esta função é pública e não requer Authorization header
  try {
    const body = await req.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));
    
    // 1. Extrair dados principais
    const { instance, data } = body;
    
    if (!data) {
      return new Response(JSON.stringify({
        error: 'Missing data'
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`Processando evento para instância: ${instance}`);

    const supabase: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Etapa adicional: Buscar o usuário responsável pela instância
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('user_id')
      .eq('evolution_instance_name', instance)
      .single();

    if (settingsError || !settings?.user_id) {
      console.error(`Não foi possível encontrar configurações ou user_id para a instância: ${instance}`, settingsError);
      throw new Error(`Configurações ou user_id não encontrados para a instância ${instance}.`);
    }
    const assignedUserId = settings.user_id;
    console.log(`Conversas desta instância serão atribuídas ao usuário: ${assignedUserId}`);


    // 2. Identificar cliente pelo remoteJid
    const phone = (data.key?.remoteJid || '').replace(/\D/g, '');
    console.log(`Buscando cliente pelo telefone: ${phone}`);
    
    let { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, phone, name')
      .eq('phone', phone)
      .single<Client>();

    if (clientError && clientError.code !== 'PGRST116') { // PGRST116 = 'exact-one-row-not-found'
        console.error('Erro ao buscar cliente:', clientError);
        throw new Error(`Erro ao buscar cliente: ${clientError.message}`);
    }

    if (!client) {
      console.log('Cliente não encontrado. Criando novo cliente...');
      const { data: newClient, error: newClientError } = await supabase
        .from('clients')
        .insert({
          name: data.pushName || phone,
          phone,
          status: 'ativo'
        })
        .select('id, phone, name')
        .single<Client>();
      
      if (newClientError) {
        console.error('Erro ao criar novo cliente:', newClientError);
        throw new Error(`Erro ao criar novo cliente: ${newClientError.message}`);
      }
      
      client = newClient;
      console.log('Novo cliente criado:', JSON.stringify(client, null, 2));
    } else {
      console.log('Cliente encontrado:', JSON.stringify(client, null, 2));
    }

    // 3. Buscar ou criar conversa
    console.log(`Buscando conversa para o client_id: ${client!.id}`);
    let { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, client_id')
      .eq('client_id', client!.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single<Conversation>();

    if (convError && convError.code !== 'PGRST116') {
        console.error('Erro ao buscar conversa:', convError);
        throw new Error(`Erro ao buscar conversa: ${convError.message}`);
    }

    if (!conversation) {
      console.log('Nenhuma conversa ativa encontrada. Criando nova conversa...');
      const { data: newConv, error: newConvError } = await supabase
        .from('conversations')
        .insert({
          client_id: client!.id,
          status: 'active',
          started_at: new Date().toISOString(),
          assigned_to: assignedUserId // <-- CORREÇÃO: Atribui a conversa ao usuário
        })
        .select('id, client_id')
        .single<Conversation>();

      if (newConvError) {
        console.error('Erro ao criar nova conversa:', newConvError);
        throw new Error(`Erro ao criar nova conversa: ${newConvError.message}`);
      }
      
      conversation = newConv;
      console.log('Nova conversa criada:', JSON.stringify(conversation, null, 2));
    } else {
      console.log('Conversa encontrada:', JSON.stringify(conversation, null, 2));
    }

    // 4. Detectar tipo de mensagem e salvar mídia se necessário
    let content = '';
    let messageType = 'text';
    let mediaUrl = null;
    let mediaType = null;
    let fileName = null;
    let fileSize: number | null = null;

    if (data.message?.conversation) {
      content = data.message.conversation;
      console.log(`Mensagem de texto detectada: "${content}"`);
    } else if (data.message?.imageMessage) {
      messageType = 'image';
      console.log('Mensagem de imagem detectada.');
      const img = data.message.imageMessage;
      content = img.caption || 'Imagem recebida';
      
      if (img.url) { // Prioriza a URL direta se disponível
        mediaUrl = img.url;
        mediaType = img.mimetype || 'image/jpeg';
        fileName = img.fileName || `image_${Date.now()}.jpg`;
        console.log(`Mídia de imagem via URL: ${mediaUrl}`);
      } else if (img.jpegThumbnail) { // Fallback para thumbnail em base64
        console.log('Salvando thumbnail da imagem...');
        const buffer = Uint8Array.from(atob(img.jpegThumbnail), c => c.charCodeAt(0));
        fileName = `image_${Date.now()}.jpg`;
        mediaType = img.mimetype || 'image/jpeg';
        fileSize = buffer.length;
        
        const filePath = `${client!.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('whatsapp-media')
          .upload(filePath, buffer, {
            contentType: mediaType,
            upsert: true
          });
        
        if (uploadError) {
            console.error('Erro no upload para o Storage:', uploadError);
        } else {
            const { data: publicUrlData } = supabase.storage.from('whatsapp-media').getPublicUrl(filePath);
            mediaUrl = publicUrlData.publicUrl;
            console.log(`Upload de thumbnail concluído. URL: ${mediaUrl}`);
        }
      }
    } else if (data.message?.audioMessage) {
      messageType = 'audio';
      console.log('Mensagem de áudio detectada.');
      const audio = data.message.audioMessage;
      
      if (audio.url) {
        mediaUrl = audio.url;
        mediaType = audio.mimetype || 'audio/ogg';
        fileName = `audio_${Date.now()}.ogg`;
        console.log(`Mídia de áudio via URL: ${mediaUrl}`);
      }
    } else if (data.message?.documentMessage) {
      messageType = 'document';
      console.log('Mensagem de documento detectada.');
      const doc = data.message.documentMessage;
      
      if (doc.url) {
        mediaUrl = doc.url;
        fileName = doc.fileName || `document_${Date.now()}`;
        mediaType = doc.mimetype || 'application/octet-stream';
        console.log(`Mídia de documento via URL: ${mediaUrl}`);
      }
    } else {
        console.log('Tipo de mensagem não suportado ou não identificado:', data.message);
    }


    // 5. Salvar mensagem no banco
    const messageToInsert = {
      conversation_id: conversation!.id,
      content: content || 'Mídia recebida',
      message_type: messageType,
      sender: data.key?.fromMe ? 'user' : 'client',
      media_url: mediaUrl,
      media_type: mediaType,
      file_name: fileName,
      file_size: fileSize,
      sent_at: new Date(data.messageTimestamp * 1000).toISOString()
    };
    
    console.log('Preparando para salvar mensagem no banco:', JSON.stringify(messageToInsert, null, 2));

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert(messageToInsert)
      .select()
      .single();

    if (messageError) {
      console.error('Erro ao salvar mensagem:', messageError);
      return new Response(JSON.stringify({
        error: 'Erro ao salvar mensagem',
        details: messageError
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Mensagem salva com sucesso. ID:', message.id);

    // 6. Atualizar última mensagem da conversa
    const updatePayload = {
        last_message_at: new Date().toISOString(),
        last_message: content || `[${messageType}] ${fileName || ''}`.trim()
    };
    console.log('Atualizando conversa:', JSON.stringify(updatePayload, null, 2));

    await supabase
      .from('conversations')
      .update(updatePayload)
      .eq('id', conversation!.id);

    console.log('Conversa atualizada com sucesso.');

    const responsePayload = {
      success: true,
      message: 'Mensagem processada com sucesso',
      data: {
        client_id: client!.id,
        conversation_id: conversation!.id,
        message_id: message.id
      }
    };
    
    console.log('Retornando sucesso:', JSON.stringify(responsePayload, null, 2));

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Erro fatal no processamento do webhook:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}); 