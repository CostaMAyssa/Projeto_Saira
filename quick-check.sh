#!/bin/bash

echo "🔍 Verificando status da instância chat saira..."

# Configurações corretas da Evolution API da Saira
API_KEY="33cf7bf9876391ff485115742bdb149a"
BASE_URL="https://evoapi.insignemarketing.com.br"
INSTANCE_NAME_ENCODED="chat%20saira"

echo "📱 Status da instância:"
curl -s -X GET "${BASE_URL}/instance/connectionState/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" | jq '.'

echo ""
echo "🔄 Tentando reconectar a instância..."
curl -s -X PUT "${BASE_URL}/instance/restart/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" | jq '.'

echo ""
echo "✅ Comando executado. Aguarde alguns segundos e verifique o status novamente."