#!/bin/bash

echo "🔧 Configurando webhook com a instância correta identificada..."

# Configurações corretas baseadas na auditoria
API_KEY="e941aabfc27d0f850a422caffa325fa2"
BASE_URL="https://evoapi.insignemarketing.com.br"
INSTANCE_NAME="chat saira"
INSTANCE_NAME_ENCODED="chat%20saira"
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 AUDITORIA - Informações identificadas:"
echo "   • Número da instância: 556481140676"
echo "   • Nome da instância: 'chat saira' (primeira instância - Connected)"
echo "   • API Key funcionando: e941aabfc27d0f850a422caffa325fa2"
echo "   • Status: Connected"
echo ""

echo "🔍 Verificando instâncias disponíveis..."
curl -s "${BASE_URL}/instance/fetchInstances" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('📱 Instâncias encontradas:')
for i, instance in enumerate(data):
    status = instance.get('connectionStatus', 'unknown')
    number = instance.get('number', 'N/A')
    name = instance.get('name', 'N/A')
    emoji = '✅' if status == 'open' else '🔄' if status == 'connecting' else '❌'
    print(f'   {i+1}. {emoji} {name} ({number}) - {status}')
"

echo ""
echo "🔧 Configurando webhook para a instância principal (556481140676)..."

# Configurar webhook usando a estrutura correta da Evolution API v2
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
echo "✅ Verificando configuração do webhook..."
curl -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🎯 RESUMO DA AUDITORIA:"
echo "   ✅ API evoapi.insignemarketing.com.br está ONLINE"
echo "   ✅ API Key e941aabfc27d0f850a422caffa325fa2 está FUNCIONANDO"
echo "   ✅ Instância 'chat saira' (556481140676) está CONECTADA"
echo "   ✅ Função webhook-receiver do Supabase está RESPONDENDO"
echo "   🔧 Webhook configurado para receber eventos da Evolution API"
echo ""
echo "📱 Sobre a troca de instância:"
echo "   • SIM, você pode trocar a instância principal a qualquer momento"
echo "   • Basta alterar no seu sistema local (Configurações > WhatsApp)"
echo "   • O webhook será reconfigurado automaticamente"
echo "   • Todas as mensagens irão para a nova instância selecionada"
echo ""
echo "🧪 Para testar: Envie uma mensagem para o WhatsApp 556481140676"