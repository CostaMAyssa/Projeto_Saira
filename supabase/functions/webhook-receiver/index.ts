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
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // Webhooks da Evolution API não enviam autenticação
  // Esta função é pública e não requer Authorization header
  try {
    const body = await req.json();
    
    // 1. Extrair dados principais
    const { event, instance, data } = body;
    
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. Identificar cliente pelo remoteJid
    const phone = (data.key?.remoteJid || '').replace(/\D/g, '');
    
    let client = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!client.data) {
      // Criar cliente se não existir
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          name: data.pushName || phone,
          phone,
          status: 'ativo'
        })
        .select()
        .single();
      
      client = { data: newClient };
    }

    // 3. Buscar ou criar conversa
    let conversation = await supabase
      .from('conversations')
      .select('*')
      .eq('client_id', client.data.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (!conversation.data) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          client_id: client.data.id,
          status: 'active',
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      conversation = { data: newConv };
    }

    // 4. Detectar tipo de mensagem e salvar mídia se necessário
    let content = '';
    let messageType = 'text';
    let mediaUrl = null;
    let mediaType = null;
    let fileName = null;
    let fileSize = null;

    if (data.message?.conversation) {
      content = data.message.conversation;
    } else if (data.message?.imageMessage) {
      messageType = 'image';
      const img = data.message.imageMessage;
      
      if (img.jpegThumbnail) {
        const buffer = Uint8Array.from(atob(img.jpegThumbnail), c => c.charCodeAt(0));
        fileName = `image_${Date.now()}.jpg`;
        mediaType = img.mimetype || 'image/jpeg';
        fileSize = buffer.length;
        
        const { data: storageData } = await supabase.storage
          .from('whatsapp-media')
          .upload(`${client.data.id}/${fileName}`, buffer, {
            contentType: mediaType,
            upsert: true
          });
        
        mediaUrl = supabase.storage
          .from('whatsapp-media')
          .getPublicUrl(`${client.data.id}/${fileName}`).data.publicUrl;
      }
    } else if (data.message?.audioMessage) {
      messageType = 'audio';
      const audio = data.message.audioMessage;
      
      if (audio.audio) {
        const buffer = Uint8Array.from(atob(audio.audio), c => c.charCodeAt(0));
        fileName = `audio_${Date.now()}.mp3`;
        mediaType = audio.mimetype || 'audio/mp3';
        fileSize = buffer.length;
        
        const { data: storageData } = await supabase.storage
          .from('whatsapp-media')
          .upload(`${client.data.id}/${fileName}`, buffer, {
            contentType: mediaType,
            upsert: true
          });
        
        mediaUrl = supabase.storage
          .from('whatsapp-media')
          .getPublicUrl(`${client.data.id}/${fileName}`).data.publicUrl;
      }
    } else if (data.message?.documentMessage) {
      messageType = 'document';
      const doc = data.message.documentMessage;
      
      if (doc.document) {
        const buffer = Uint8Array.from(atob(doc.document), c => c.charCodeAt(0));
        fileName = doc.fileName || `document_${Date.now()}.pdf`;
        mediaType = doc.mimetype || 'application/pdf';
        fileSize = buffer.length;
        
        const { data: storageData } = await supabase.storage
          .from('whatsapp-media')
          .upload(`${client.data.id}/${fileName}`, buffer, {
            contentType: mediaType,
            upsert: true
          });
        
        mediaUrl = supabase.storage
          .from('whatsapp-media')
          .getPublicUrl(`${client.data.id}/${fileName}`).data.publicUrl;
      }
    }

    // 5. Salvar mensagem no banco (APENAS COLUNAS QUE EXISTEM)
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.data.id,
        content: content || 'Mídia enviada',
        message_type: messageType,
        sender: data.key?.fromMe ? 'user' : 'client',
        media_url: mediaUrl,
        media_type: mediaType,
        file_name: fileName,
        file_size: fileSize,
        sent_at: new Date(data.messageTimestamp * 1000).toISOString()
      })
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

    // 6. Atualizar última mensagem da conversa
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message: content || 'Mídia enviada'
      })
      .eq('id', conversation.data.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Mensagem processada com sucesso',
      data: {
        client_id: client.data.id,
        conversation_id: conversation.data.id,
        message_id: message.id
      }
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
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