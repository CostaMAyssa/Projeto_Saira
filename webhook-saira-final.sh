#!/bin/bash

echo "🔧 Reconfigurando webhook com configurações corretas da Saira..."

# Configurações corretas da Evolution API da Saira
API_KEY="33cf7bf9876391ff485115742bdb149a"
BASE_URL="https://evoapi.insignemarketing.com.br"
INSTANCE_NAME="chat saira"
INSTANCE_NAME_ENCODED="chat%20saira"
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 Verificando instâncias disponíveis..."
curl -X GET "${BASE_URL}/instance/fetchInstances" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🔍 Verificando status da instância '${INSTANCE_NAME}'..."
curl -X GET "${BASE_URL}/instance/connectionState/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🔧 Configurando webhook (método 1 - estrutura evolutionApi.ts)..."
curl -X POST "${BASE_URL}/webhook/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  -d '{
    "url": "'${WEBHOOK_URL}'",
    "webhook_by_events": true,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE", 
      "MESSAGES_DELETE",
      "CONNECTION_UPDATE",
      "QRCODE_UPDATED"
    ]
  }'

echo ""
echo ""
echo "🔧 Configurando webhook (método 2 - estrutura documentação)..."
curl -X POST "${BASE_URL}/webhook/set/${INSTANCE_NAME_ENCODED}" \
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
        "MESSAGES_UPDATE", 
        "MESSAGES_DELETE",
        "CONNECTION_UPDATE",
        "QRCODE_UPDATED"
      ]
    }
  }'

echo ""
echo ""
echo "✅ Verificando configuração final do webhook..."
curl -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🎯 Webhook reconfigurado com a API key correta! Agora teste enviando uma mensagem para o WhatsApp da instância '${INSTANCE_NAME}'."