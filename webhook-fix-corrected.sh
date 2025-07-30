#!/bin/bash

echo "🔧 Reconfigurando webhook com estrutura correta..."

# Configurações
API_KEY="B6D711FCDE4D4FD5936544120E713976"
BASE_URL="https://evolution.codegrana.com.br"
INSTANCE_NAME="chat saira"
INSTANCE_NAME_ENCODED="chat%20saira"
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 Verificando instância atual..."
curl -X GET "${BASE_URL}/instance/fetchInstances" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🔧 Configurando webhook com estrutura do evolutionApi.ts..."
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
echo "🔧 Testando com estrutura da documentação (fallback)..."
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
echo "✅ Verificando configuração do webhook..."
curl -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🎯 Webhook reconfigurado com ambas as estruturas! Agora teste enviando uma mensagem para o WhatsApp da instância."