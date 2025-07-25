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
    if (!conversationId || !userId || (!text && !file && !audio)) {
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

    // 3. Função para detectar tipo de mídia melhorada
    const getMediaType = (mimeType: string) => {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
      return 'document';
    };

    // 4. Se houver arquivo/áudio, salvar no Storage
    let mediaUrl = null, mediaType = null, fileName = null, fileSize = null;
    if (file || audio) {
      const media = file || audio;
      try {
        // --- SANITIZAÇÃO DO NOME DO ARQUIVO ---
        function sanitizeFileName(name: string) {
          return name
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
            .replace(/[^a-zA-Z0-9.\-_]/g, '_') // só letras, números, ponto, hífen, underscore
            .replace(/\s+/g, '_') // espaços por underscore
            .replace(/_+/g, '_') // múltiplos underscores por um só
            .toLowerCase();
        }
        
        // --- CONVERSÃO ROBUSTA BASE64 PARA BINÁRIO ---
        function base64ToUint8Array(base64: string) {
          const cleaned = base64.replace(/^data:[^;]+;base64,/, '');
          const binaryString = atob(cleaned);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        }
        
        fileName = media.name ? sanitizeFileName(media.name) : `media_${Date.now()}.${audio ? 'webm' : 'bin'}`;
        mediaType = media.type || (audio ? 'audio/webm' : 'application/octet-stream');
        
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
        
        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('whatsapp-media')
          .getPublicUrl(storageData.path);
        
        mediaUrl = publicUrl;
        console.log('Mídia salva com sucesso:', mediaUrl);
        
      } catch (decodeError) {
        console.error('Erro ao processar mídia:', decodeError);
        return new Response(JSON.stringify({
          error: 'Erro ao processar mídia',
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

    // 5. Montar payload Evolution API
    let evoRes;
    let endpoint;
    let evoPayload;

    if (audio) {
      // Endpoint específico para áudio
      endpoint = `${settings.api_url}/message/sendWhatsAppAudio/${evolutionInstance}`;
      const cleanBase64 = audio.base64.replace(/^data:[^;]+;base64,/, '');
      evoPayload = {
        number: clientPhone,
        audio: cleanBase64
      };
    } else if (file) {
      // Endpoint para mídia (imagens e documentos)
      endpoint = `${settings.api_url}/message/sendMedia/${evolutionInstance}`;
      const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, '');
      const mediaCategory = getMediaType(mediaType);
      
      // Log detalhado para debugging de imagens
      console.log('Processando arquivo:', {
        fileName,
        mediaType,
        mediaCategory,
        base64Length: cleanBase64.length,
        isImage: mediaType.startsWith('image/')
      });
      
      evoPayload = {
        number: clientPhone,
        mediatype: mediaCategory,
        mimetype: mediaType,
        caption: text || '',
        media: cleanBase64,
        fileName: fileName
      };
      
      // Log específico para imagens
      if (mediaCategory === 'image') {
        console.log('🖼️ ENVIANDO IMAGEM para Evolution API:', {
          endpoint,
          mediatype: mediaCategory,
          mimetype: mediaType,
          fileName,
          captionLength: (text || '').length,
          base64Preview: cleanBase64.substring(0, 50) + '...'
        });
      }
    } else {
      // Endpoint para texto
      endpoint = `${settings.api_url}/message/sendText/${evolutionInstance}`;
      evoPayload = {
        number: clientPhone,
        text: text || ''
      };
    }

    console.log('Enviando para Evolution API:', { 
      endpoint, 
      payload: { 
        ...evoPayload, 
        media: evoPayload.media ? `[BASE64_DATA_${evoPayload.media.length}_chars]` : undefined 
      } 
    });

    // 6. Enviar para Evolution API
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
      console.log('Resposta da Evolution API:', { status: evoRes.status, data: evoData });
      
      // Log específico para erros de imagem
      if (file && getMediaType(mediaType) === 'image' && !evoRes.ok) {
        console.error('❌ ERRO ao enviar IMAGEM:', {
          status: evoRes.status,
          response: evoData,
          payload: {
            mediatype: getMediaType(mediaType),
            mimetype: mediaType,
            fileName,
            base64Length: file.base64.replace(/^data:[^;]+;base64,/, '').length
          }
        });
      }
      
    } catch (evoError) {
      console.error('Erro ao enviar para Evolution API:', evoError);
      return new Response(JSON.stringify({
        error: 'Erro ao enviar para Evolution API',
        details: evoError?.message || 'Erro desconhecido'
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
        details: evoData,
        status: evoRes.status
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // 7. Salvar mensagem no banco
    const messageContent = text || (audio ? '🎵 Áudio gravado' : `📎 ${fileName || 'Arquivo'}`);
    
    // Corrigir o message_type para usar os tipos específicos que o frontend espera
    let messageType = 'text';
    if (audio) {
      messageType = 'audio';
    } else if (file) {
      // Usar a função getMediaType para determinar o tipo correto
      messageType = getMediaType(mediaType);
    }
    
    // Função para criar timestamp no fuso horário brasileiro
    const createBrazilianTimestamp = () => {
      return new Date().toLocaleString('sv-SE', {
        timeZone: 'America/Sao_Paulo'
      }).replace(' ', 'T') + '.000Z';
    };

    const { error: insertError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      content: messageContent,
      sender: 'user',
      sent_at: createBrazilianTimestamp(),
      message_type: messageType,
      media_url: mediaUrl,
      media_type: mediaType,
      file_name: fileName,
      file_size: fileSize
    });

    if (insertError) {
      console.error('Erro ao salvar mensagem:', insertError);
    }

    return new Response(JSON.stringify({
      success: true,
      evolutionResponse: evoData,
      mediaUrl: mediaUrl
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