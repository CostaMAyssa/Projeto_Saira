# 🧪 TESTE DE ARQUIVOS - EVOLUTION API

## **📋 CHECKLIST DE TESTES**

### **✅ 1. CONFIGURAÇÃO PRÉVIA**
- [ ] Execute o script `scripts/setup-storage.sql` no Supabase Dashboard
- [ ] Verifique se o bucket `whatsapp-media` foi criado
- [ ] Confirme que as políticas RLS estão ativas

### **✅ 2. TESTE DE IMAGEM**
```bash
curl -X POST https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver \
  -H "Content-Type: application/json" \
  -d @test-image-payload.json
```

**Payload esperado:**
```json
{
  "success": true,
  "message": "Mensagem processada com sucesso",
  "data": {
    "client_id": "f7792059-28de-40a2-8ee5-b55f79192a71",
    "conversation_id": "70ccc69c-a83e-4004-b089-a177d38de321",
    "message_id": "uuid-da-mensagem"
  }
}
```

### **✅ 3. TESTE DE ÁUDIO**
```bash
curl -X POST https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "caldasIA",
    "data": {
      "key": {
        "remoteJid": "556481365341@s.whatsapp.net",
        "fromMe": false,
        "id": "TEST_AUDIO_001"
      },
      "pushName": "Teste Áudio",
      "status": "DELIVERY_ACK",
      "message": {
        "audioMessage": {
          "audio": "SGVsbG8gV29ybGQ=",
          "mimetype": "audio/mp3",
          "fileLength": "12345",
          "mediaKey": "test-audio-key-123"
        }
      },
      "messageType": "audioMessage",
      "messageTimestamp": 1752927185,
      "instanceId": "f86c8b02-29df-4de1-ac9d-1e8c78d7475c",
      "source": "android"
    }
  }'
```

### **✅ 4. TESTE DE DOCUMENTO**
```bash
curl -X POST https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "caldasIA",
    "data": {
      "key": {
        "remoteJid": "556481365341@s.whatsapp.net",
        "fromMe": false,
        "id": "TEST_DOC_001"
      },
      "pushName": "Teste Documento",
      "status": "DELIVERY_ACK",
      "message": {
        "documentMessage": {
          "document": "SGVsbG8gV29ybGQ=",
          "fileName": "teste.pdf",
          "mimetype": "application/pdf",
          "fileLength": "12345",
          "mediaKey": "test-doc-key-123"
        }
      },
      "messageType": "documentMessage",
      "messageTimestamp": 1752927185,
      "instanceId": "f86c8b02-29df-4de1-ac9d-1e8c78d7475c",
      "source": "android"
    }
  }'
```

## **🔍 VERIFICAÇÕES**

### **1. Verificar no Banco de Dados**
```sql
-- Verificar mensagens com mídia
SELECT 
  id,
  content,
  message_type,
  media_url,
  media_type,
  file_name,
  file_size,
  sent_at
FROM messages 
WHERE message_type IN ('image', 'audio', 'document')
ORDER BY sent_at DESC
LIMIT 10;
```

### **2. Verificar no Storage**
- Vá para **Supabase Dashboard** → **Storage** → **whatsapp-media**
- Verifique se os arquivos foram uploadados
- Teste se as URLs públicas funcionam

### **3. Verificar no Frontend**
- Abra o chat no navegador
- Verifique se as mensagens com mídia aparecem
- Teste se as imagens/áudios/documentos são exibidos corretamente

## **🎯 RESULTADO ESPERADO**

✅ **Webhook processa arquivos** - Imagens, áudios e documentos
✅ **Storage salva arquivos** - Bucket `whatsapp-media` com arquivos
✅ **Banco registra metadados** - URLs, tipos, tamanhos
✅ **Frontend exibe mídia** - Imagens, players de áudio, links de download
✅ **Realtime funciona** - Mídia aparece em tempo real no chat 