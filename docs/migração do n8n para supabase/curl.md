# teste de curl


## Evolution configuracoes 
# Configurar o webhook na Evolution API de produção
curl -X POST http://URL_DA_EVOLUTION_API/webhook/set/INSTANCIA \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver",
    "enabled": true,
    "events": ["messages.upsert", "messages.update", "messages.delete"]
  }'

## teste ✅ Mensagem enviada com sucesso para o WhatsApp

curl -X POST https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/send-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc" \
  -d '{
    "conversationId": "70ccc69c-a83e-4004-b089-a177d38de321",
    "text": "Teste de mensagem via curl com payload limpo",
    "userId": "fe39cc23-b68b-4526-a514-c92b877cac0c",
    "evolutionInstance": "caldasIA",
    "clientPhone": "556481365341",
    "clientName": "Mateus Correa | Automação & IA",
    "clientId": "f7792059-28de-40a2-8ee5-b55f79192a71"
  }'

### Resposta da Evolution API
  {
  "success": true,
  "evoData": {
    "key": {
      "remoteJid": "556481365341@s.whatsapp.net",
      "fromMe": true,
      "id": "3EB0DF1A40B383B0DC01EAAFE3416A023557C178"
    },
    "status": "PENDING",
    "message": {
      "conversation": "Teste de mensagem via curl com payload limpo"
    },
    "messageTimestamp": 1752927185
  }
}

## Este comando simula uma mensagem recebida da Evolution API para testar o webhook

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

  ### Resposta da Evolution API

  {
  "success": true,
  "message": "Mensagem processada com sucesso",
  "data": {
    "client_id": "f7792059-28de-40a2-8ee5-b55f79192a71",
    "conversation_id": "70ccc69c-a83e-4004-b089-a177d38de321", 
    "message_id": "d9f7b09f-66a2-41bf-9ab6-7cc64b1969b7"
  }
}