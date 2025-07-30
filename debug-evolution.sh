#!/bin/bash

echo "🔍 Verificando configuração da Evolution API..."

# Configurações
EVOLUTION_URL="https://evoapi.insignemarketing.com.br"
API_KEY="33cf7bf9876391ff485115742bdb149a"
INSTANCE_NAME="green-pharmacy"

echo "📡 1. Verificando status da instância..."
curl -X GET "${EVOLUTION_URL}/instance/fetchInstances" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "🔧 2. Verificando configuração do webhook da instância..."
curl -X GET "${EVOLUTION_URL}/webhook/find/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "📊 3. Verificando configuração global do webhook..."
curl -X GET "${EVOLUTION_URL}/webhook/settings" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "🔄 4. Reconfigurando webhook da instância (se necessário)..."
curl -X POST "${EVOLUTION_URL}/webhook/set/${INSTANCE_NAME}" \
  -H "apikey: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver",
    "events": [
      "MESSAGES_UPSERT",
      "CONNECTION_UPDATE"
    ],
    "webhook_by_events": false
  }' | jq '.'

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "🧪 Para testar o recebimento:"
echo "1. Execute: ./test-webhook.sh"
echo "2. Envie uma mensagem para o WhatsApp da instância"
echo "3. Verifique os logs no Supabase Functions"