
---

# 🟢 **1. Função HTTP: Envio de Mensagens (`/send-message`)**

```typescript
// /functions/send-message/index.ts
import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  try {
    const body = await req.json()
    // 1. Validar payload
    const {
      conversationId, text, file, audio, userId,
      evolutionInstance, clientPhone, clientName, clientId
    } = body

    if (!conversationId || !userId || (!text && !file && !audio)) {
      return new Response(JSON.stringify({ error: 'Dados obrigatórios faltando' }), { status: 400 })
    }

    // 2. Buscar settings do usuário/instância
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .eq('evolution_instance_name', evolutionInstance)
      .single()

    if (!settings) {
      return new Response(JSON.stringify({ error: 'Configuração da instância não encontrada' }), { status: 404 })
    }

    // 3. Se houver arquivo/áudio, salvar no Storage
    let mediaUrl = null, mediaType = null, fileName = null, fileSize = null
    if (file || audio) {
      const media = file || audio
      const buffer = Uint8Array.from(atob(media.base64), c => c.charCodeAt(0))
      fileName = media.name
      mediaType = media.type
      fileSize = buffer.length

      const { data: storageData, error: storageError } = await supabase.storage
        .from('whatsapp-media')
        .upload(`${userId}/${evolutionInstance}/${Date.now()}_${fileName}`, buffer, {
          contentType: mediaType,
          upsert: true
        })
      if (storageError) {
        return new Response(JSON.stringify({ error: 'Erro ao salvar mídia', details: storageError }), { status: 500 })
      }
      mediaUrl = supabase.storage.from('whatsapp-media').getPublicUrl(storageData.path).publicUrl
    }

    // 4. Montar payload Evolution API
    const payload: any = {
      conversationId,
      text,
      userId,
      evolutionInstance,
      clientPhone,
      clientName,
      clientId
    }
    if (mediaUrl) {
      payload.mediaUrl = mediaUrl
      payload.mediaType = mediaType
      payload.fileName = fileName
      payload.fileSize = fileSize
    }

    // 5. Enviar para Evolution API
    const evoRes = await fetch(`${settings.evolution_api_url}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': settings.evolution_api_key
      },
      body: JSON.stringify(payload)
    })
    const evoData = await evoRes.json()
    if (!evoRes.ok) {
      return new Response(JSON.stringify({ error: 'Erro Evolution API', details: evoData }), { status: 500 })
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
    })

    return new Response(JSON.stringify({ success: true, evoData }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno', details: err.message }), { status: 500 })
  }
})
```

---

# 🟣 **2. Função HTTP: Recebimento de Mensagens (`/receive-message`)**

```typescript
// /functions/receive-message/index.ts
import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  try {
    const body = await req.json()
    // 1. Extrair dados principais
    const { event, instance, data } = body
    if (!data) return new Response('Missing data', { status: 400 })

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // 2. Identificar cliente pelo remoteJid
    const phone = (data.key?.remoteJid || '').replace(/\D/g, '')
    let client = await supabase.from('clients').select('*').eq('phone', phone).single()
    if (!client.data) {
      // Criar cliente se não existir
      const { data: newClient } = await supabase.from('clients').insert({
        name: data.pushName || phone,
        phone,
        status: 'ativo'
      }).select().single()
      client = { data: newClient }
    }

    // 3. Buscar ou criar conversa
    let conversation = await supabase.from('conversations')
      .select('*')
      .eq('client_id', client.data.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()
    if (!conversation.data) {
      const { data: newConv } = await supabase.from('conversations').insert({
        client_id: client.data.id,
        status: 'active',
        started_at: new Date().toISOString()
      }).select().single()
      conversation = { data: newConv }
    }

    // 4. Detectar tipo de mensagem e salvar mídia se necessário
    let content = '', messageType = 'text', mediaUrl = null, mediaType = null, fileName = null, fileSize = null
    if (data.message?.conversation) {
      content = data.message.conversation
    } else if (data.message?.imageMessage) {
      messageType = 'image'
      const img = data.message.imageMessage
      // Suporte a base64 ou url
      if (img.jpegThumbnail) {
        const buffer = Uint8Array.from(atob(img.jpegThumbnail), c => c.charCodeAt(0))
        fileName = `image_${Date.now()}.jpg`
        mediaType = img.mimetype || 'image/jpeg'
        fileSize = buffer.length
        const { data: storageData } = await supabase.storage
          .from('whatsapp-media')
          .upload(`${client.data.id}/${fileName}`, buffer, { contentType: mediaType, upsert: true })
        mediaUrl = supabase.storage.from('whatsapp-media').getPublicUrl(storageData.path).publicUrl
      } else if (img.url) {
        mediaUrl = img.url
        mediaType = img.mimetype
      }
      content = '[Imagem]'
    } else if (data.message?.audioMessage) {
      messageType = 'audio'
      const audio = data.message.audioMessage
      if (audio.url) {
        mediaUrl = audio.url
        mediaType = audio.mimetype
      }
      content = '[Áudio]'
    } else if (data.message?.documentMessage) {
      messageType = 'file'
      const doc = data.message.documentMessage
      if (doc.url) {
        mediaUrl = doc.url
        mediaType = doc.mimetype
        fileName = doc.fileName
        fileSize = doc.fileLength
      }
      content = '[Arquivo]'
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
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno', details: err.message }), { status: 500 })
  }
})
```

---

# 🟠 **Exemplo de Payloads**

## **Envio de Texto**
```json
{
  "conversationId": "abc-123",
  "text": "Olá, tudo bem?",
  "userId": "user-uuid",
  "evolutionInstance": "caldasIA",
  "clientPhone": "5511999999999",
  "clientName": "Cliente Exemplo",
  "clientId": "client-uuid"
}
```

## **Envio de Arquivo**
```json
{
  "conversationId": "abc-123",
  "file": {
    "name": "exemplo.pdf",
    "base64": "JVBERi0xLjQKJcfs...",
    "type": "application/pdf"
  },
  "userId": "user-uuid",
  "evolutionInstance": "caldasIA",
  "clientPhone": "5511999999999",
  "clientName": "Cliente Exemplo",
  "clientId": "client-uuid"
}
```

## **Recebimento Evolution API (imagem base64)**
```json
{
  "event": "messages.upsert",
  "instance": "caldasIA",
  "data": {
    "key": { "remoteJid": "5511999999999@s.whatsapp.net", "fromMe": false },
    "pushName": "Cliente Exemplo",
    "message": {
      "imageMessage": {
        "mimetype": "image/jpeg",
        "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD...",
        "url": null
      }
    },
    "messageTimestamp": 1752333564
  }
}
```

---

# 🟢 **Próximos Passos**

1. **Criar os buckets no Supabase Storage** (ex: `whatsapp-media`)
2. **Deploy das funções no Supabase**
3. **Testar todos os fluxos (texto, arquivo, áudio, imagem)**
4. **Ajustar frontend para consumir as novas rotas**
5. **Ajustar triggers/índices se necessário para performance**

---

Se quiser, posso detalhar:
- Como criar o bucket no Supabase Storage
- Como configurar as Edge Functions no Supabase
- Como tratar autenticação/segurança
- Como fazer fallback para arquivos grandes

Só avisar!
