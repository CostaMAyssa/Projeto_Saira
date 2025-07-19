# 🚀 Deploy da Solução de Webhook para Produção

## **📋 Passos para Deploy:**

### **1. Executar SQL de Configuração:**

```bash
# No Supabase Dashboard → SQL Editor
# Execute o arquivo: docs/sql/webhook_setup.sql
```

### **2. Deploy da Nova Função:**

```bash
# Deploy da função webhook-receiver
supabase functions deploy webhook-receiver --no-verify-jwt --project-ref svkgfvfhmngcvfsjpero
```

### **3. Verificar Deploy:**

```bash
# Listar funções
supabase functions list --project-ref svkgfvfhmngcvfsjpero
```

## **🧪 Teste da Nova Função:**

### **Teste Básico:**

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
        "id": "3EB0F4A1F841F02958FB74"
      },
      "pushName": "Mateus Correa | Automação & IA",
      "status": "DELIVERY_ACK",
      "message": {
        "conversation": "Olá! Esta é uma mensagem de teste recebida via webhook"
      },
      "messageType": "conversation",
      "messageTimestamp": 1752927185,
      "instanceId": "f86c8b02-29df-4de1-ac9d-1e8c78d7475c",
      "source": "android"
    }
  }'
```

### **Teste com Dados Reais:**

```bash
curl -X POST https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "caldasIA",
    "data": {
      "key": {
        "remoteJid": "556492067866@s.whatsapp.net",
        "fromMe": false,
        "id": "E25EB936355C9CADBE3364323B8D3554"
      },
      "pushName": "Mayssa Ferreira",
      "status": "DELIVERY_ACK",
      "message": {
        "conversation": "Oi"
      },
      "messageType": "conversation",
      "messageTimestamp": 1750876007,
      "instanceId": "f86c8b02-29df-4de1-ac9d-1e8c78d7475c",
      "source": "android"
    }
  }'
```

## **🔧 Configuração na Evolution API:**

### **1. Configurar Webhook:**

```bash
# Configurar webhook na Evolution API
curl -X POST http://localhost:8080/webhook/set/caldasIA \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver",
    "enabled": true,
    "events": ["messages.upsert", "messages.update", "messages.delete"]
  }'
```

### **2. Verificar Configuração:**

```bash
# Verificar webhook configurado
curl -X GET http://localhost:8080/webhook/find/caldasIA
```

## **📊 Verificação de Funcionamento:**

### **1. Verificar Logs:**

```bash
# Ver logs da função
supabase functions logs webhook-receiver --project-ref svkgfvfhmngcvfsjpero
```

### **2. Verificar Dados no Banco:**

```sql
-- Verificar mensagens recebidas
SELECT 
    m.id,
    m.content,
    m.message_type,
    m.sender_type,
    m.timestamp,
    m.evolution_message_id,
    m.evolution_instance,
    c.name as client_name,
    c.phone as client_phone
FROM messages m
JOIN conversations conv ON m.conversation_id = conv.id
JOIN clients c ON conv.client_id = c.id
WHERE m.evolution_instance = 'caldasIA'
ORDER BY m.timestamp DESC
LIMIT 10;
```

### **3. Verificar Clientes Criados:**

```sql
-- Verificar clientes criados via webhook
SELECT 
    id,
    name,
    phone,
    status,
    created_at
FROM clients
WHERE phone LIKE '556%'
ORDER BY created_at DESC
LIMIT 10;
```

## **🔄 Migração Completa:**

### **1. Remover Função Antiga:**

```bash
# Remover função antiga (opcional)
supabase functions delete receive-message --project-ref svkgfvfhmngcvfsjpero
```

### **2. Atualizar Frontend (se necessário):**

A função `send-message` continua funcionando normalmente, apenas o webhook de recebimento mudou de URL.

## **✅ Checklist de Produção:**

- [ ] SQL executado com sucesso
- [ ] Função webhook-receiver deployada
- [ ] Teste básico funcionando
- [ ] Teste com dados reais funcionando
- [ ] Webhook configurado na Evolution API
- [ ] Logs verificados
- [ ] Dados salvos no banco
- [ ] Frontend funcionando normalmente

## **🚨 Troubleshooting:**

### **Se ainda retornar 401:**
1. Verificar se o arquivo `config.toml` foi criado
2. Fazer deploy novamente com `--no-verify-jwt`
3. Verificar configurações globais do Supabase

### **Se não salvar dados:**
1. Verificar se as políticas RLS foram criadas
2. Verificar se o bucket `whatsapp-media` existe
3. Verificar logs da função

### **Se Evolution API não enviar webhooks:**
1. Verificar se a URL está correta
2. Verificar se o webhook está habilitado
3. Verificar logs da Evolution API 