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

  // Webhooks da Evolution API não enviam autenticação
  // Removida verificação de Authorization header

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

    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    
    // 2. Identificar cliente pelo remoteJid
    const phone = (data.key?.remoteJid || '').replace(/\D/g, '');
    let client = await supabase.from('clients').select('*').eq('phone', phone).single();
    
    if (!client.data) {
      // Criar cliente se não existir
      const { data: newClient } = await supabase.from('clients').insert({
        name: data.pushName || phone,
        phone,
        status: 'ativo'
      }).select().single();
      client = {
        data: newClient
      };
    }

    // 3. Buscar ou criar conversa
    let conversation = await supabase.from('conversations').select('*').eq('client_id', client.data.id).order('started_at', {
      ascending: false
    }).limit(1).single();
    
    if (!conversation.data) {
      const { data: newConv } = await supabase.from('conversations').insert({
        client_id: client.data.id,
        status: 'active',
        started_at: new Date().toISOString()
      }).select().single();
      conversation = {
        data: newConv
      };
    }

    // 4. Detectar tipo de mensagem e salvar mídia se necessário
    let content = '', messageType = 'text', mediaUrl = null, mediaType = null, fileName = null, fileSize = null;
    
    if (data.message?.conversation) {
      content = data.message.conversation;
    } else if (data.message?.imageMessage) {
      messageType = 'image';
      const img = data.message.imageMessage;
      // Suporte a base64 ou url
      if (img.jpegThumbnail) {
        const buffer = Uint8Array.from(atob(img.jpegThumbnail), (c) => c.charCodeAt(0));
        fileName = `image_${Date.now()}.jpg`;
        mediaType = img.mimetype || 'image/jpeg';
        fileSize = buffer.length;
        const { data: storageData } = await supabase.storage.from('whatsapp-media').upload(`${client.data.id}/${fileName}`, buffer, {
          contentType: mediaType,
          upsert: true
        });
        mediaUrl = supabase.storage.from('whatsapp-media').getPublicUrl(storageData.path).publicUrl;
      } else if (img.url) {
        mediaUrl = img.url;
        mediaType = img.mimetype;
      }
      content = '[Imagem]';
    } else if (data.message?.audioMessage) {
      messageType = 'audio';
      const audio = data.message.audioMessage;
      if (audio.url) {
        mediaUrl = audio.url;
        mediaType = audio.mimetype;
      }
      content = '[Áudio]';
    } else if (data.message?.documentMessage) {
      messageType = 'file';
      const doc = data.message.documentMessage;
      if (doc.url) {
        mediaUrl = doc.url;
        mediaType = doc.mimetype;
        fileName = doc.fileName;
        fileSize = doc.fileLength;
      }
      content = '[Arquivo]';
    }

    // 5. Salvar mensagem recebida
    await supabase.from('messages').insert({
      conversation_id: conversation.data.id,
      content,
      sender: 'client',
      sent_at: new Date((data.messageTimestamp || Date.now()) * 1000).toISOString(),
      message_type: messageType,
      media_url: mediaUrl,
      media_type: mediaType,
      file_name: fileName,
      file_size: fileSize
    });

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (err) {
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