#!/bin/bash

echo "🧪 Testando correção da duplicação de mensagens..."
echo ""

# Configurações
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 Teste 1: Simulando mensagem ENVIADA (fromMe: true) - deve ser IGNORADA"
echo "URL: $WEBHOOK_URL"
echo ""

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "chat saira",
    "data": {
      "key": {
        "remoteJid": "556481140676@s.whatsapp.net",
        "fromMe": true,
        "id": "TEST_SENT_MESSAGE_' $(date +%s) '"
      },
      "pushName": "Teste",
      "messageTimestamp": ' $(date +%s) ',
      "message": {
        "conversation": "Mensagem de teste enviada - deve ser ignorada"
      }
    }
  }'

echo ""
echo ""
echo "📋 Teste 2: Simulando mensagem RECEBIDA (fromMe: false) - deve ser PROCESSADA"
echo ""

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert", 
    "instance": "chat saira",
    "data": {
      "key": {
        "remoteJid": "556481140676@s.whatsapp.net",
        "fromMe": false,
        "id": "TEST_RECEIVED_MESSAGE_' $(date +%s) '"
      },
      "pushName": "Cliente Teste",
      "messageTimestamp": ' $(date +%s) ',
      "message": {
        "conversation": "Mensagem de teste recebida - deve ser processada"
      }
    }
  }'

echo ""
echo ""
echo "✅ Testes concluídos!"
echo ""
echo "📊 Resultados esperados:"
echo "  - Teste 1: 'ok - mensagem própria ignorada'"
echo "  - Teste 2: 'ok' (mensagem processada normalmente)"
echo ""
echo "🎯 Agora teste no chat real:"
echo "  1. Envie uma mensagem no chat"
echo "  2. Verifique se aparece apenas UMA vez"
echo "  3. Confirme que o horário está correto"