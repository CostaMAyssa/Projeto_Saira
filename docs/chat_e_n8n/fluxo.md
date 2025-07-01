
## 🔄 **FLUXO COMPLETO: WhatsApp → N8N → Supabase → Sistema**

### **1. ORIGEM: WhatsApp/Evolution API**
- **Evolution API** monitora mensagens do WhatsApp
- Quando chega uma mensagem, dispara webhook para o N8N
- **Dados enviados**: `remoteJid`, `conversation`, `messageTimestamp`, `pushName`, `fromMe`, etc.

### **2. PROCESSAMENTO: N8N (Fluxo Analisado)**

**🔗 Sequência do N8N:**
1. **Webhook** (`baeb0df0-2550-4327-b262-ff093a0e62f1`) recebe dados do Evolution
2. **If1** → Filtra apenas mensagens que NÃO são nossas (`fromMe: false`)
3. **Variáveis** → Extrai:
   - `customer_phone` = `remoteJid` 
   - `message_content` = `conversation`
   - `message_timestamp` = `messageTimestamp`
   - `instance_name` = `instance`
   - `name` = `pushName`

4. **Compara Instância** → Busca na tabela `settings` o `user_id` pela `evolution_instance_name`
5. **Compara Whatsapp** → Verifica se cliente já existe na tabela `clients`
6. **If** → Se cliente não existe, cria novo cliente
7. **Encontrar Conversa** → Busca conversa ativa na tabela `conversations`
8. **Existe Conversa?** → Se não existe, cria nova conversa
9. **Supabase1** → **INSERE A MENSAGEM** na tabela `messages`:
   ```json
   {
     "conversation_id": "id_da_conversa",
     "content": "conteúdo_da_mensagem", 
     "sender": "client",
     "sent_at": "timestamp_iso"
   }
   ```

### **3. ARMAZENAMENTO: Supabase**
- **Tabela `messages`** recebe a nova mensagem
- **Realtime** detecta o INSERT na tabela

### **4. TEMPO REAL: Supabase Realtime → Sistema**

**📡 Como o Sistema Recebe:**
```typescript
// src/components/chat/ChatWindow.tsx (linhas 35-65)
const channel = supabase
  .channel('messages-realtime')
  .on(
    'postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `conversation_id=eq.${activeConversation}`
    },
    (payload) => {
      // 🎯 AQUI CHEGA A MENSAGEM EM TEMPO REAL!
      const msg = payload.new as DbMessage;
      const newMessage: Message = {
        id: msg.message_id || msg.id,
        content: msg.content,
        sender: msg.from_me ? 'pharmacy' : 'client',
        timestamp: new Date(msg.sent_at).toLocaleTimeString()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  )
```

### **5. ENVIO DE RESPOSTA: Sistema → N8N → WhatsApp**

**📤 Quando você responde:**
```typescript
// 1. Salva no Supabase
await supabase.from('messages').insert({
  conversation_id: activeConversation,
  content: content,
  sender: 'user', // farmácia
  sent_at: new Date().toISOString()
});

// 2. Envia para webhook N8N (VITE_N8N_WEBHOOK_URL)
await fetch(webhookUrl, {
  method: 'POST',
  body: JSON.stringify({
    conversationId: activeConversation,
    text: content
  })
});
```

## 🔍 **ESTRUTURA DOS DADOS**

**Exemplo de mensagem que chega do WhatsApp:**
```json
{
  "event": "messages.upsert",
  "instance": "caldasIA", 
  "data": {
    "key": {
      "remoteJid": "556481140676@s.whatsapp.net",
      "fromMe": false
    },
    "pushName": "Mayssa Ferreira",
    "message": {
      "conversation": "Oii"
    },
    "messageTimestamp": 1750876007
  }
}
```

**Como fica no Supabase (tabela `messages`):**
```json
{
  "conversation_id": "uuid_da_conversa",
  "content": "Oii",
  "sender": "client",
  "sent_at": "2025-01-25T15:26:47.000Z"
}
```

## 🚨 **PONTOS CRÍTICOS PARA FUNCIONAMENTO**

1. **N8N deve estar ativo** e processando webhooks
2. **Supabase Realtime** deve estar habilitado nas tabelas
3. **Credenciais do N8N** devem estar corretas (usando conta "Erick")
4. **URL do webhook** deve estar configurada no `.env`

**Agora entende o fluxo completo?** O sistema funciona como um "espelho" em tempo real do que acontece no WhatsApp, passando pelo N8N como orquestrador central.
