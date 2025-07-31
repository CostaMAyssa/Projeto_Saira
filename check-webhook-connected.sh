#!/bin/bash

echo "🔍 Verificando configuração do webhook da instância conectada..."

# Configurações corretas da Evolution API da Saira
API_KEY="33cf7bf9876391ff485115742bdb149a"
BASE_URL="https://evoapi.insignemarketing.com.br"
INSTANCE_NAME_ENCODED="chat%20saira"

echo "📋 Verificando webhook atual:"
curl -s -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" | jq '.'

echo ""
echo "🔧 Reconfigurando webhook para garantir que está correto..."
curl -s -X POST "${BASE_URL}/webhook/set/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver",
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
  }' | jq '.'

echo ""
echo "✅ Verificando configuração final:"
curl -s -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" | jq '.'