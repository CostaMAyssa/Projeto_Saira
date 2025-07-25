#!/bin/bash

# =====================================================
# TESTE DO WEBHOOK RECEIVER
# =====================================================

echo "🧪 Testando webhook receiver..."

# URL do webhook receiver
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

# Payload de teste simulando uma mensagem recebida
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance": "caldasIA",
    "data": {
      "key": {
        "remoteJid": "5561999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "TEST_MESSAGE_' $(date +%s) '"
      },
      "pushName": "Teste Cliente",
      "message": {
        "conversation": "Mensagem de teste para verificar se o webhook está funcionando"
      },
      "messageTimestamp": ' $(date +%s) '
    }
  }'

echo ""
echo "✅ Teste enviado! Verifique se a mensagem apareceu no sistema."