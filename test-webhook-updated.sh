#!/bin/bash

echo "🧪 Testando webhook-receiver após atualizações..."

# URL do webhook
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo ""
echo "1️⃣ Testando conectividade básica..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}' \
  -w "\nStatus: %{http_code}\nTempo: %{time_total}s\n"

echo ""
echo "2️⃣ Testando com dados simulados da Evolution API..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "chat saira",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "test_message_123"
      },
      "pushName": "Teste Webhook",
      "message": {
        "conversation": "Olá, esta é uma mensagem de teste do webhook!"
      },
      "messageTimestamp": '$(date +%s)'
    }
  }' \
  -w "\nStatus: %{http_code}\nTempo: %{time_total}s\n"

echo ""
echo "3️⃣ Verificando logs da função..."
echo "Acesse: https://supabase.com/dashboard/project/svkgfvfhmngcvfsjpero/functions"

echo ""
echo "✅ Teste concluído!"