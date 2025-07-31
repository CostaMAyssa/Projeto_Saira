#!/bin/bash

echo "🔧 CORREÇÃO RÁPIDA: Webhook de Recebimento"
echo "🎯 Foco: Resolver JSON malformado e payloads vazios"
echo ""

# Configurações
API_KEY="33cf7bf9876391ff485115742bdb149a"
BASE_URL="https://evoapi.insignemarketing.com.br"
INSTANCE_NAME="chat saira"
INSTANCE_NAME_ENCODED="chat%20saira"
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 DIAGNÓSTICO ATUAL:"
echo "   ❌ JSON malformado: SyntaxError: Unterminated string in JSON at position 120"
echo "   ❌ Payloads vazios: Payload completo: undefined"
echo "   ❌ Dados ausentes: remoteJid não encontrado"
echo ""

echo "🔄 PASSO 1: Verificando status atual da instância..."
curl -s -X GET "${BASE_URL}/instance/connectionState/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo "🔧 PASSO 2: Removendo webhook corrompido..."
curl -s -X DELETE "${BASE_URL}/webhook/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo "⏳ Aguardando 3 segundos..."
sleep 3

echo ""
echo "🔧 PASSO 3: Reconfigurando webhook com configurações limpas..."
curl -s -X POST "${BASE_URL}/webhook/set/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "'${WEBHOOK_URL}'",
      "byEvents": true,
      "base64": false,
      "events": [
        "MESSAGES_UPSERT"
      ]
    }
  }'

echo ""
echo "✅ PASSO 4: Verificando configuração aplicada..."
curl -s -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo "🧪 PASSO 5: Teste simples do webhook..."
curl -s -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "instance": "chat saira",
    "data": {
      "key": {
        "remoteJid": "5564920194270@s.whatsapp.net",
        "fromMe": false,
        "id": "test_quick_fix_'$(date +%s)'"
      },
      "pushName": "Teste Rápido",
      "message": {
        "conversation": "🔧 Teste correção webhook - '$(date '+%H:%M:%S')'"
      },
      "messageTimestamp": '$(date +%s)'
    }
  }'

echo ""
echo ""
echo "✅ CORREÇÃO APLICADA!"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "   1. Peça para a Mayssa enviar uma mensagem"
echo "   2. Verifique se aparece no chat da aplicação"
echo "   3. Se não funcionar, execute: ./fix-webhook-corruption.sh"
echo ""
echo "📊 MONITORAMENTO:"
echo "   - Logs Supabase: https://supabase.com/dashboard/project/svkgfvfhmngcvfsjpero/logs/edge-functions"
echo "   - Webhook Status: curl -H 'apikey: ${API_KEY}' ${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}"