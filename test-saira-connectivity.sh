#!/bin/bash

echo "🔧 Testando conectividade com Evolution API da Saira..."

# Configurações corretas
API_KEY="B6D711FCDE4D4FD5936544120E713976"
BASE_URL="https://evoapi.insignemarketing.com.br"
INSTANCE_NAME="chat saira"
INSTANCE_NAME_ENCODED="chat%20saira"
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "🌐 Testando conectividade básica..."
curl -X GET "${BASE_URL}" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "📋 Testando listagem de instâncias..."
curl -X GET "${BASE_URL}/instance/fetchInstances" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  -v

echo ""
echo ""
echo "🔍 Testando endpoint alternativo para instâncias..."
curl -X GET "${BASE_URL}/instance" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🔍 Testando status da instância específica..."
curl -X GET "${BASE_URL}/instance/connectionState/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🔍 Testando webhook find..."
curl -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "✅ Teste de conectividade concluído!"