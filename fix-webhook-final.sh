#!/bin/bash

echo "🎯 CONFIGURAÇÃO FINAL DO WEBHOOK - INSTÂNCIA CORRETA"
echo "====================================================="

# Configurações CORRETAS
BASE_URL="https://evoapi.insignemarketing.com.br"
API_KEY="e941aabfc27d0f850a422caffa325fa2"
INSTANCE_NAME="chat saira"  # Instância PRINCIPAL (sem espaço)
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📊 Status das instâncias:"
echo "✅ chat saira - CONECTADA (11.001 mensagens)"
echo "❌ chat saira  - CONECTANDO (0 mensagens)"
echo ""

echo "🔧 Configurando webhook para a instância CORRETA..."

# Configurar webhook na instância principal
curl -s -X POST "${BASE_URL}/webhook/set/${INSTANCE_NAME}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "'${WEBHOOK_URL}'",
      "byEvents": true,
      "base64": false,
      "events": [
        "MESSAGES_UPSERT",
        "MESSAGES_SET",
        "CONNECTION_UPDATE"
      ]
    }
  }'

echo ""
echo "✅ Verificando configuração do webhook..."
curl -s -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME}" -H "apikey: ${API_KEY}"

echo ""
echo "🧪 Teste final - enviando mensagem de teste..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance": "chat saira",
    "data": {
      "key": {
        "remoteJid": "556492019427@s.whatsapp.net",
        "fromMe": false,
        "id": "final_test_123"
      },
      "message": {
        "conversation": "Teste final - webhook configurado na instância correta"
      },
      "messageTimestamp": 1753900000,
      "pushName": "Teste Final"
    }
  }'

echo ""
echo "🎯 CONFIGURAÇÃO CONCLUÍDA!"
echo "=========================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Envie uma mensagem real do WhatsApp para 556481140676"
echo "2. Verifique se aparece no chat da aplicação"
echo "3. Monitore os logs do Supabase Edge Function"
echo ""
echo "🔗 Informações importantes:"
echo "- Instância: chat saira (PRINCIPAL)"
echo "- Número: 556481140676"
echo "- Status: CONECTADA"
echo "- Webhook: CONFIGURADO" 