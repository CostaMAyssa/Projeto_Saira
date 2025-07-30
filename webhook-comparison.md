# Comparação de Configuração de Webhook

## 🔍 Problema Identificado
As mensagens de teste via curl chegam ao chat, mas as mensagens reais da Evolution API não chegam.

## 📊 Comparação das Configurações

### 1. Script Atual (reconfigure-webhook-final.sh)
```bash
# URL: https://evolution.codegrana.com.br/webhook/set/chat%20saira
# Método: POST
# Headers: apikey: B6D711FCDE4D4FD5936544120E713976
# Payload:
{
  "url": "https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver",
  "enabled": true,
  "events": [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE", 
    "MESSAGES_DELETE",
    "CONNECTION_UPDATE"
  ]
}
```

### 2. Função evolutionApi.ts (setWebhook)
```typescript
// URL: /webhook/${instanceName}
// Método: POST
// Payload:
{
  "url": webhookUrl,
  "webhook_by_events": true,    // ⚠️ DIFERENÇA!
  "webhook_base64": false,      // ⚠️ DIFERENÇA!
  "events": [
    "QRCODE_UPDATED",
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "MESSAGES_DELETE",
    "CONNECTION_UPDATE"
  ]
}
```

### 3. WhatsAppTab.tsx (configureWebhook)
```typescript
// Usa evolutionApi.setWebhook() com eventos:
[
  "MESSAGES_UPSERT",
  "MESSAGES_UPDATE", 
  "MESSAGES_DELETE",
  "CONNECTION_UPDATE",
  "QRCODE_UPDATED"
]
```

### 4. Documentação Evolution API (Postman Collection)
```json
{
  "webhook": {
    "enabled": true,
    "url": "https://webhook.site",
    "headers": {
      "autorization": "Bearer TOKEN",
      "Content-Type": "application/json"
    },
    "byEvents": false,           // ⚠️ DIFERENÇA!
    "base64": false,
    "events": [...]
  }
}
```

## 🚨 Principais Diferenças Encontradas

### 1. Estrutura do Payload
- **Script atual**: Payload direto com `enabled: true`
- **evolutionApi.ts**: Usa `webhook_by_events: true` e `webhook_base64: false`
- **Documentação**: Usa estrutura aninhada com `webhook: { ... }`

### 2. Parâmetros Específicos
- **webhook_by_events**: Não está sendo usado no script atual
- **webhook_base64**: Não está sendo usado no script atual
- **byEvents**: Conflito entre `webhook_by_events` e `byEvents`

### 3. Endpoint
- **Script atual**: `/webhook/set/${instance}`
- **evolutionApi.ts**: `/webhook/${instance}`

## 🔧 Correções Necessárias

### Opção 1: Usar estrutura da documentação
```json
{
  "webhook": {
    "enabled": true,
    "url": "https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver",
    "byEvents": true,
    "base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "MESSAGES_DELETE", 
      "CONNECTION_UPDATE"
    ]
  }
}
```

### Opção 2: Usar estrutura do evolutionApi.ts
```json
{
  "url": "https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver",
  "webhook_by_events": true,
  "webhook_base64": false,
  "events": [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "MESSAGES_DELETE",
    "CONNECTION_UPDATE"
  ]
}
```

### Opção 3: Testar endpoint diferente
- Trocar `/webhook/set/` por `/webhook/`

## 🎯 Próximos Passos
1. Testar com a estrutura correta do payload
2. Verificar se o endpoint está correto
3. Adicionar parâmetros `webhook_by_events` e `webhook_base64`
4. Comparar com configuração que funciona no frontend