import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  try {
    const body = await req.json();
    console.log('📨 Webhook recebido:', JSON.stringify(body, null, 2));
    
    // 1. Extrair dados principais
    const { event, instance, data } = body;
    if (!data) {
      console.error('❌ Dados ausentes no webhook');
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // 2. Identificar cliente pelo remoteJid
    const phone = (data.key?.remoteJid || '').replace(/\D/g, '');
    console.log('📱 Telefone extraído:', phone);
    
    let client = await supabase.from('clients').select('*').eq('phone', phone).single();
    
    if (!client.data) {
      console.log('👤 Cliente não encontrado, criando novo...');
      // Criar cliente se não existir
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: data.pushName || phone,
          phone,
          status: 'ativo'
        })
        .select()
        .single();
        
      if (createClientError) {
        console.error('❌ Erro ao criar cliente:', createClientError);
        throw new Error('Erro ao criar cliente');
      }
      
      client = { data: newClient };
      console.log('✅ Cliente criado:', newClient.id);
    } else {
      console.log('✅ Cliente encontrado:', client.data.id);
    }

    // 3. Buscar ou criar conversa usando a função RPC corrigida
    console.log('🔍 Buscando ou criando conversa...');
    const { data: conversationId, error: conversationError } = await supabase
      .rpc('get_or_create_conversation_corrected', {
        p_client_id: client.data.id,
        p_assigned_to: null
      });

    if (conversationError) {
      console.error('❌ Erro ao buscar/criar conversa:', conversationError);
      throw new Error('Erro ao buscar/criar conversa');
    }

    console.log('✅ Conversa ID:', conversationId);

    // 4. Detectar tipo de mensagem e salvar mídia se necessário
    let content = '', messageType = 'text', mediaUrl = null, mediaType = null, fileName = null, fileSize = null;
    
    if (data.message?.conversation) {
      content = data.message.conversation;
      console.log('💬 Mensagem de texto recebida');
    } else if (data.message?.imageMessage) {
      messageType = 'image';
      const img = data.message.imageMessage;
      console.log('🖼️ Mensagem de imagem recebida');
      
      // Suporte a base64 ou url
      if (img.jpegThumbnail) {
        try {
          const buffer = Uint8Array.from(atob(img.jpegThumbnail), (c) => c.charCodeAt(0));
          fileName = `image_${Date.now()}.jpg`;
          mediaType = img.mimetype || 'image/jpeg';
          fileSize = buffer.length;
          
          const { data: storageData, error: storageError } = await supabase.storage
            .from('whatsapp-media')
            .upload(`${client.data.id}/${fileName}`, buffer, {
              contentType: mediaType,
              upsert: true
            });
            
          if (storageError) {
            console.error('❌ Erro ao fazer upload da imagem:', storageError);
          } else {
            mediaUrl = supabase.storage.from('whatsapp-media').getPublicUrl(storageData.path).data.publicUrl;
            console.log('✅ Imagem salva:', mediaUrl);
          }
        } catch (uploadError) {
          console.error('❌ Erro no processamento da imagem:', uploadError);
        }
      } else if (img.url) {
        mediaUrl = img.url;
        mediaType = img.mimetype;
        console.log('✅ URL da imagem:', mediaUrl);
      }
      content = '[Imagem]';
    } else if (data.message?.audioMessage) {
      messageType = 'audio';
      const audio = data.message.audioMessage;
      console.log('🎵 Mensagem de áudio recebida');
      
      if (audio.url) {
        mediaUrl = audio.url;
        mediaType = audio.mimetype;
      }
      content = '[Áudio]';
    } else if (data.message?.documentMessage) {
      messageType = 'file';
      const doc = data.message.documentMessage;
      console.log('📄 Documento recebido');
      
      if (doc.url) {
        mediaUrl = doc.url;
        mediaType = doc.mimetype;
        fileName = doc.fileName;
        fileSize = doc.fileLength;
      }
      content = '[Arquivo]';
    }

    // 5. Salvar mensagem recebida
    console.log('💾 Salvando mensagem...');
    const { error: messageError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      content,
      sender: 'client',
      sent_at: new Date((data.messageTimestamp || Date.now()) * 1000).toISOString(),
      message_type: messageType,
      media_url: mediaUrl,
      media_type: mediaType,
      file_name: fileName,
      file_size: fileSize
    });

    if (messageError) {
      console.error('❌ Erro ao salvar mensagem:', messageError);
      throw new Error('Erro ao salvar mensagem');
    }

    console.log('✅ Mensagem salva com sucesso');

    return new Response(JSON.stringify({
      success: true,
      conversationId,
      messageType,
      clientId: client.data.id
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (err) {
    console.error('💥 Erro no receive-message:', err);
    return new Response(JSON.stringify({
      error: 'Erro interno',
      details: err.message
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
});