#!/bin/bash

echo "🔧 Reconfigurando webhook na Evolution API após correção..."

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
echo "🔧 Configurando webhook..."
curl -X POST "${BASE_URL}/webhook/set/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  -d '{
    "url": "'${WEBHOOK_URL}'",
    "enabled": true,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE", 
      "MESSAGES_DELETE",
      "CONNECTION_UPDATE"
    ]
  }'

echo ""
echo ""
echo "✅ Verificando configuração do webhook..."
curl -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🎯 Webhook reconfigurado! Agora teste enviando uma mensagem para o WhatsApp da instância."