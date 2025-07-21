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
        // Melhor tratamento do base64
        let buffer;
        if (media.base64) {
          // Remover prefixo data: se existir
          const base64Data = media.base64.replace(/^data:[^;]+;base64,/, '');
          
          // Verificar se o base64 é válido
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
            throw new Error('Invalid base64 format');
          }
          
          // Decodificar base64
          const binaryString = atob(base64Data);
          buffer = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            buffer[i] = binaryString.charCodeAt(i);
          }
        } else {
          throw new Error('Base64 data is missing');
        }
        
        fileName = media.name || `audio_${Date.now()}.webm`;
        mediaType = media.type || 'audio/webm';
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
        
        mediaUrl = supabase.storage.from('whatsapp-media').getPublicUrl(storageData.path).publicUrl;
        console.log('Mídia salva com sucesso:', mediaUrl);
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
    let evoRes;
    let endpoint;
    
    if (audio) {
      // Endpoint específico para áudio usando sendWhatsAppAudio
      endpoint = `${settings.api_url}/message/sendWhatsAppAudio/${evolutionInstance}`;
      
      // Remover prefixo data: do base64 para a Evolution API
      const cleanBase64 = audio.base64.replace(/^data:[^;]+;base64,/, '');
      
      // Payload correto para áudio na Evolution API
      const audioPayload = {
        number: clientPhone,
        audio: cleanBase64 // Enviar base64 puro diretamente
      };
      
      console.log('Enviando áudio para Evolution API:', endpoint);
      console.log('Payload do áudio:', {
        number: clientPhone,
        audioLength: cleanBase64.length
      });
      
      evoRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.api_key
        },
        body: JSON.stringify(audioPayload)
      });
    } else {
      // Endpoint para texto e outros tipos
      endpoint = `${settings.api_url}/message/sendText/${evolutionInstance}`;
      evoRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.api_key
        },
        body: JSON.stringify(payload)
      });
    }
    
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