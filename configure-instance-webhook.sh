#!/bin/bash

# 🔧 Script para Configurar Webhook por Instância (Recomendado pela Evolution API)
# Baseado na documentação oficial: https://doc.evolution-api.com/v2/en/configuration/webhooks

echo "🚀 Configurando Webhook por Instância..."

# Configurações
EVOLUTION_API_URL="http://localhost:8080"  # Ajuste conforme sua configuração
API_KEY="B6D711FCDE4D4FD5936544120E713976"  # Sua API key
INSTANCE_NAME="green-pharmacy"  # Nome da sua instância
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 Configurações:"
echo "   API URL: $EVOLUTION_API_URL"
echo "   Instância: $INSTANCE_NAME"
echo "   Webhook URL: $WEBHOOK_URL"
echo ""

# 1. Verificar se a instância existe
echo "🔍 Verificando se a instância existe..."
INSTANCE_CHECK=$(curl -s -X GET \
  "$EVOLUTION_API_URL/instance/fetchInstances" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json")

echo "Resposta da verificação de instâncias:"
echo "$INSTANCE_CHECK" | jq '.' 2>/dev/null || echo "$INSTANCE_CHECK"
echo ""

# 2. Configurar webhook da instância
echo "⚙️ Configurando webhook da instância..."
WEBHOOK_CONFIG=$(curl -s -X POST \
  "$EVOLUTION_API_URL/webhook/set/$INSTANCE_NAME" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "'$WEBHOOK_URL'",
    "webhook_by_events": true,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "CONNECTION_UPDATE"
    ]
  }')

echo "Resposta da configuração do webhook:"
echo "$WEBHOOK_CONFIG" | jq '.' 2>/dev/null || echo "$WEBHOOK_CONFIG"
echo ""

# 3. Verificar configuração do webhook
echo "✅ Verificando configuração do webhook..."
WEBHOOK_STATUS=$(curl -s -X GET \
  "$EVOLUTION_API_URL/webhook/find/$INSTANCE_NAME" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json")

echo "Status atual do webhook:"
echo "$WEBHOOK_STATUS" | jq '.' 2>/dev/null || echo "$WEBHOOK_STATUS"
echo ""

# 4. Testar conectividade do webhook
echo "🧪 Testando conectividade do webhook..."
WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}')

if [ "$WEBHOOK_TEST" = "200" ] || [ "$WEBHOOK_TEST" = "201" ]; then
    echo "✅ Webhook acessível (HTTP $WEBHOOK_TEST)"
else
    echo "❌ Webhook não acessível (HTTP $WEBHOOK_TEST)"
fi

echo ""
echo "🎯 Configuração concluída!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Verifique os logs do Supabase Functions"
echo "   2. Envie uma mensagem de teste no WhatsApp"
echo "   3. Monitore a tabela 'messages' no banco de dados"
echo ""
echo "🔧 Para verificar logs do Supabase:"
echo "   npx supabase functions logs webhook-receiver --follow"