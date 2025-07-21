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
    
    // Buscar configurações do usuário
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('api_url, api_key, evolution_instance_name')
      .eq('user_id', userId)
      .eq('evolution_instance_name', evolutionInstance)
      .single();
    
    if (settingsError || !settings) {
      console.error('Erro ao buscar configurações:', settingsError);
      return new Response(JSON.stringify({
        error: 'Configuração da instância não encontrada',
        details: settingsError?.message || 'Settings não encontradas'
      }), {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // Verificar se as configurações estão completas
    if (!settings.api_url || !settings.api_key) {
      return new Response(JSON.stringify({
        error: 'Configuração incompleta',
        details: 'URL da API ou chave da API não configuradas'
      }), {
        status: 400,
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
      try {
        // --- SANITIZAÇÃO DO NOME DO ARQUIVO ---
        function sanitizeFileName(name) {
          return name
            .normalize('NFD').replace(/[ -]/g, '') // remove acentos
            .replace(/[^a-zA-Z0-9.\-_]/g, '_') // só letras, números, ponto, hífen, underscore
            .replace(/\s+/g, '_') // espaços por underscore
            .replace(/_+/g, '_') // múltiplos underscores por um só
            .toLowerCase();
        }
        // --- CONVERSÃO ROBUSTA BASE64 PARA BINÁRIO ---
        function base64ToUint8Array(base64) {
          const cleaned = base64.replace(/^data:[^;]+;base64,/, '');
          const binaryString = atob(cleaned);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        }
        fileName = media.name ? sanitizeFileName(media.name) : `audio_${Date.now()}.webm`;
        mediaType = media.type || 'audio/webm';
        // Usar função robusta para converter base64 em buffer
        const buffer = base64ToUint8Array(media.base64);
        fileSize = buffer.length;
        console.log('Salvando mídia:', {
          fileName,
          mediaType,
          fileSize,
          base64Length: media.base64.length
        });
        const { data: storageData, error: storageError } = await supabase.storage
          .from('whatsapp-media')
          .upload(`${userId}/${evolutionInstance}/${Date.now()}_${fileName}`, buffer, {
            contentType: mediaType,
            upsert: true
          });
        console.log('storageData:', storageData);
        if (storageError) {
          console.error('Erro no storage:', storageError);
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
        // Corrigir obtenção da URL pública (compatível com diferentes versões da SDK)
        let publicUrl = '';
        let publicUrlObj = supabase.storage.from('whatsapp-media').getPublicUrl(storageData.path);
        console.log('getPublicUrl result:', publicUrlObj);
        publicUrl = publicUrlObj.data ? publicUrlObj.data.publicUrl : publicUrlObj.publicUrl;
        mediaUrl = publicUrl;
        console.log('Mídia salva com sucesso:', mediaUrl);
        if (!mediaUrl) {
          console.error('URL pública da mídia não gerada corretamente! storageData:', storageData);
        }
      } catch (decodeError) {
        console.error('Erro ao decodificar base64:', decodeError);
        return new Response(JSON.stringify({
          error: 'Erro ao processar áudio',
          details: decodeError.message
        }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // 4. Montar payload Evolution API
    let evoRes;
    let endpoint;
    let evoPayload;

    if (audio) {
      // Endpoint específico para áudio usando sendWhatsAppAudio
      endpoint = `${settings.api_url}/message/sendWhatsAppAudio/${evolutionInstance}`;
      // Remover prefixo data: do base64 para a Evolution API
      const cleanBase64 = audio.base64.replace(/^data:[^;]+;base64,/, '');
      // Payload correto para áudio na Evolution API
      evoPayload = {
        number: clientPhone,
        audio: cleanBase64 // Enviar base64 puro diretamente
      };
    } else if (file) {
      // Detectar tipo de mídia
      const isImage = typeof mediaType === 'string' && mediaType.startsWith('image');
      const isDocument = typeof mediaType === 'string' && !mediaType.startsWith('image');
      endpoint = `${settings.api_url}/message/sendMedia/${evolutionInstance}`;
      // Enviar base64 puro no campo media (sem prefixo)
      const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, '');
      evoPayload = {
        number: clientPhone,
        mediatype: isImage ? 'image' : 'document',
        mimetype: mediaType,
        caption: text || '',
        media: cleanBase64,
        fileName: fileName
      };
    } else {
      // Endpoint para texto
      endpoint = `${settings.api_url}/message/sendText/${evolutionInstance}`;
      evoPayload = {
        number: clientPhone,
        text: text || ''
      };
    }

    // LOG do payload e endpoint
    console.log('Enviando para Evolution API:', { endpoint, evoPayload });

    // 5. Enviar para Evolution API
    let evoData;
    try {
      evoRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.api_key
        },
        body: JSON.stringify(evoPayload)
      });
      evoData = await evoRes.json();
      console.log('Resposta da Evolution API:', { status: evoRes.status, evoData });
    } catch (evoError) {
      console.error('Erro ao enviar para Evolution API:', evoError);
      return new Response(JSON.stringify({
        error: 'Erro ao enviar para Evolution API',
        details: evoError && evoError.message ? evoError.message : evoError
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
    if (!evoRes.ok) {
      console.error('Erro Evolution API:', evoData);
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
      content: text || (audio ? '🎵 Áudio gravado' : '[Mídia]'),
      sender: 'user',
      sent_at: new Date().toISOString(),
      message_type: audio ? 'audio' : (mediaType ? 'media' : 'text'),
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
    console.error('Erro interno:', err);
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