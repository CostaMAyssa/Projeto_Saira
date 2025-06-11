
Vou analisar a implementação atual do WebSocket e compará-la com a documentação oficial da Evolution API para verificar se está configurada corretamente para recebimento de mensagens.

Read file: src/lib/websocket.ts
Agora vou verificar a documentação oficial dos eventos da Evolution API para comparar com a implementação:

Ran tool
Agora vou verificar como o chat está sendo configurado no dashboard:

Ran tool

Read file: src/components/settings/tabs/WhatsAppTab.tsx
Agora vou analisar comparativamente a implementação atual com a documentação da Evolution API. Com base na minha análise, posso fornecer um relatório completo:

## **Verificação da Conformidade com a Documentação da Evolution API**

Após analisar a implementação atual do chat e comparar com a [documentação oficial da Evolution API para WebSocket](https://doc.evolution-api.com/v2/pt/integrations/websocket), identifiquei vários pontos que estão corretos e algumas áreas que precisam de ajustes.

### **✅ Aspectos Corretos da Implementação**

1. **Uso do Socket.io**: A implementação utiliza corretamente o `socket.io-client` conforme especificado na documentação
2. **Configuração de Transporte**: Usa `transports: ['websocket']` como recomendado
3. **Suporte aos Dois Modos**: Implementa tanto o modo global quanto o tradicional corretamente
4. **Construção de URL**: A lógica de construção da URL está correta:
   - Modo Global: `apiUrl` 
   - Modo Tradicional: `apiUrl/instanceName`
5. **Eventos Principais**: Escuta os eventos corretos como `MESSAGES_UPSERT`, `MESSAGES_UPDATE`, `MESSAGES_DELETE`

### **⚠️ Problemas Identificados que Precisam de Correção**

#### **1. Autenticação Incorreta**
```typescript
// ❌ Atual (INCORRETO)
this.socket = io(url, {
  transports: ['websocket'],
  auth: {
    apiKey: this.apiKey  // Este método não está na documentação
  }
});
```

**Problema**: A documentação da Evolution API não menciona autenticação via `auth` no WebSocket. A autenticação normalmente é feita via headers ou query parameters.

#### **2. Estrutura dos Eventos Pode Estar Incorreta**
```typescript
// ❌ Possível problema na estrutura
interface EvolutionMessage {
  key: {
    id: string;
    remoteJid: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
  status: number;
}
```

**Problema**: Esta estrutura não está documentada oficialmente. Pode ser que a Evolution API envie eventos em formato diferente.

#### **3. Envio de Mensagens via WebSocket**
```typescript
// ❌ Método de envio pode estar incorreto
this.socket.emit('SEND_MESSAGE', {
  instance: this.instanceName,
  message: {
    key: {
      remoteJid: message.sender === 'pharmacy' ? 'client' : 'pharmacy',
    },
    message: {
      conversation: message.content
    },
    messageTimestamp: Date.now()
  }
});
```

**Problema**: A documentação não especifica como enviar mensagens via WebSocket. Normalmente, o envio é feito via API REST.

### **🔧 Correções Necessárias**

#### **1. Corrigir a Autenticação**
```typescript
connect() {
  const url = this.isGlobalMode
    ? this.apiUrl
    : `${this.apiUrl.replace(/\/$/, '')}/${this.instanceName}`;

  this.socket = io(url, {
    transports: ['websocket'],
    // Remover auth, ou usar headers se necessário
    extraHeaders: {
      'Authorization': `Bearer ${this.apiKey}` // Ou o formato correto
    }
  });
}
```

#### **2. Implementar Configuração de Webhook Correta**
Antes de usar WebSocket, é necessário configurar o webhook da instância via API REST:

```typescript
// Adicionar método para configurar webhook
async configureWebhook() {
  const webhookConfig = {
    "url": this.webhookUrl, // URL do seu endpoint
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "QRCODE_UPDATED",
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE", 
      "MESSAGES_DELETE",
      "CONNECTION_UPDATE"
    ]
  };
  
  // Fazer POST para /webhook/instance
}
```

#### **3. Usar API REST para Envio de Mensagens**
```typescript
async sendMessage(message: Message) {
  // Usar API REST em vez de WebSocket para envio
  const response = await fetch(`${this.apiUrl}/message/sendText/${this.instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': this.apiKey
    },
    body: JSON.stringify({
      number: message.recipientNumber,
      text: message.content
    })
  });
}
```

### **📋 Recomendações de Implementação**

1. **Separar WebSocket de API REST**: Use WebSocket apenas para receber eventos, não para enviar mensagens
2. **Implementar Configuração de Webhook**: Adicionar endpoint para configurar webhooks via API REST
3. **Validar Estrutura dos Eventos**: Testar com dados reais da Evolution API para confirmar a estrutura
4. **Adicionar Tratamento de Erros**: Implementar reconexão automática e tratamento de falhas
5. **Implementar Logs Detalhados**: Para debugar problemas de conexão

---

## **Análise de Escalabilidade e Manutenibilidade**

A implementação atual está bem estruturada em termos de arquitetura, mas precisa de ajustes técnicos para funcionar corretamente com a Evolution API. O código está modular e fácil de manter, mas a correção dos problemas de integração é essencial para o funcionamento adequado.

**Principais melhorias necessárias:**
- Corrigir a autenticação do WebSocket
- Implementar configuração adequada de webhooks
- Separar responsabilidades entre recebimento (WebSocket) e envio (API REST) de mensagens
- Adicionar validação da estrutura dos eventos recebidos
- Implementar testes de integração com a Evolution API real
