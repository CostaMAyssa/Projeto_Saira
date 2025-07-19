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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Verificação de autenticação
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({
      error: 'Missing authorization header'
    }), {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const body = await req.json();
    
    // 1. Validar payload
    const { conversationId, text, file, audio, userId, evolutionInstance, clientPhone, clientName, clientId } = body;
    if (!conversationId || !userId || !text && !file && !audio) {
      return new Response(JSON.stringify({
        error: 'Dados obrigatórios faltando'
      }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // 2. Buscar settings do usuário/instância
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: settings } = await supabase.from('settings').select('*').eq('user_id', userId).eq('evolution_instance_name', evolutionInstance).single();
    
    if (!settings) {
      return new Response(JSON.stringify({
        error: 'Configuração da instância não encontrada'
      }), {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // 3. Se houver arquivo/áudio, salvar no Storage
    let mediaUrl = null, mediaType = null, fileName = null, fileSize = null;
    if (file || audio) {
      const media = file || audio;
      const buffer = Uint8Array.from(atob(media.base64), (c) => c.charCodeAt(0));
      fileName = media.name;
      mediaType = media.type;
      fileSize = buffer.length;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('whatsapp-media')
        .upload(`${userId}/${evolutionInstance}/${Date.now()}_${fileName}`, buffer, {
          contentType: mediaType,
          upsert: true
        });
      
      if (storageError) {
        return new Response(JSON.stringify({
          error: 'Erro ao salvar mídia',
          details: storageError
        }), {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        });
      }
      
      mediaUrl = supabase.storage.from('whatsapp-media').getPublicUrl(storageData.path).publicUrl;
    }

    // 4. Montar payload Evolution API
    const payload = {
      number: clientPhone, // Campo obrigatório para a Evolution API
      text: text || ''
    };
    
    if (mediaUrl) {
      payload.mediaUrl = mediaUrl;
      payload.mediaType = mediaType;
      payload.fileName = fileName;
      payload.fileSize = fileSize;
    }

    // 5. Enviar para Evolution API
    const evoRes = await fetch(`${settings.evolution_api_url}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': settings.evolution_api_key
      },
      body: JSON.stringify(payload)
    });
    
    const evoData = await evoRes.json();
    if (!evoRes.ok) {
      return new Response(JSON.stringify({
        error: 'Erro Evolution API',
        details: evoData
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // 6. Salvar mensagem no banco
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      content: text || '[Mídia]',
      sender: 'user',
      sent_at: new Date().toISOString(),
      message_type: mediaType ? 'media' : 'text',
      media_url: mediaUrl,
      media_type: mediaType,
      file_name: fileName,
      file_size: fileSize
    });

    return new Response(JSON.stringify({
      success: true,
      evoData
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
    
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Erro interno',
      details: err.message
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}); 