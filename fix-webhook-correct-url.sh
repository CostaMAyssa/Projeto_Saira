#!/bin/bash

echo "🔍 DIAGNÓSTICO DO PROBLEMA DO WEBHOOK - URL CORRIGIDA"
echo "======================================================"

# Configurações CORRETAS
BASE_URL="https://evoapi.insignemarketing.com.br"
API_KEY="e941aabfc27d0f850a422caffa325fa2"  # API Key CORRETA
INSTANCE_NAME="chat saira"
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📊 Analisando logs..."
echo ""

# 1. Verificar se o webhook está configurado corretamente
echo "🔧 1. Verificando configuração atual do webhook..."
curl -s -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME}" -H "apikey: ${API_KEY}"

echo ""
echo "📋 2. Verificando instâncias disponíveis..."
curl -s -X GET "${BASE_URL}/instance/fetchInstances" -H "apikey: ${API_KEY}"

echo ""
echo "📋 3. Testando conectividade do webhook..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance": "chat saira",
    "data": {
      "key": {
        "remoteJid": "556492019427@s.whatsapp.net",
        "fromMe": false,
        "id": "test_connectivity_123"
      },
      "message": {
        "conversation": "Teste de conectividade do webhook"
      },
      "messageTimestamp": 1753900000,
      "pushName": "Teste Sistema"
    }
  }'

echo ""
echo "🔄 4. Reconfigurando webhook com configurações limpas..."

# Desabilitar webhook atual
curl -s -X POST "${BASE_URL}/webhook/set/${INSTANCE_NAME}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  -d '{
    "webhook": {
      "enabled": false,
      "url": "",
      "byEvents": false,
      "base64": false,
      "events": []
    }
  }'

sleep 2

# Reconfigurar webhook com configurações corretas
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
echo "✅ 5. Verificando nova configuração..."
curl -s -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME}" -H "apikey: ${API_KEY}"

echo ""
echo "🧪 6. Teste final - enviando mensagem de teste..."
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
        "conversation": "Teste final após reconfiguração"
      },
      "messageTimestamp": 1753900000,
      "pushName": "Teste Final"
    }
  }'

echo ""
echo "🎯 DIAGNÓSTICO CONCLUÍDO!"
echo "=========================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Verifique os logs do Supabase Edge Function"
echo "2. Envie uma mensagem real do WhatsApp"
echo "3. Monitore se as mensagens chegam corretamente"
echo ""
echo "🔗 URLs importantes:"
echo "- Webhook URL: $WEBHOOK_URL"
echo "- Evolution API: $BASE_URL"
echo "- Instância: $INSTANCE_NAME"
echo "- API Key: ${API_KEY:0:8}..." 