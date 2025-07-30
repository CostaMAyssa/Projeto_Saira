#!/bin/bash

# 🔧 Script para Configurar Webhook com Dados Reais do Banco
# Usando as configurações corretas da instância "chat saira"

echo "🚀 Configurando Webhook com dados reais da instância 'chat saira'..."

# Configurações reais do banco de dados
API_URL="https://evoapi.insignemarketing.com.br"
API_KEY="e941aabfc27d0f850a422caffa325fa2"  # API key real da instância "chat saira"
INSTANCE_NAME="chat saira"  # Nome real da instância
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 Configurações reais:"
echo "   API URL: $API_URL"
echo "   API KEY: $API_KEY"
echo "   Instância: $INSTANCE_NAME"
echo "   Webhook URL: $WEBHOOK_URL"
echo ""

# 1. Verificar se a instância existe
echo "🔍 Verificando se a instância existe..."
INSTANCE_CHECK=$(curl -s -X GET \
  "$API_URL/instance/fetchInstances" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json")

echo "Resposta da verificação de instâncias:"
echo "$INSTANCE_CHECK" | jq '.' 2>/dev/null || echo "$INSTANCE_CHECK"
echo ""

# 2. Verificar status da instância específica
echo "🔍 Verificando status da instância '$INSTANCE_NAME'..."
INSTANCE_STATUS=$(curl -s -X GET \
  "$API_URL/instance/connectionState/$INSTANCE_NAME" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json")

echo "Status da instância '$INSTANCE_NAME':"
echo "$INSTANCE_STATUS" | jq '.' 2>/dev/null || echo "$INSTANCE_STATUS"
echo ""

# 3. Configurar webhook da instância
echo "⚙️ Configurando webhook da instância..."
WEBHOOK_CONFIG=$(curl -s -X POST \
  "$API_URL/webhook/set/$INSTANCE_NAME" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "'$WEBHOOK_URL'",
    "webhook_by_events": true,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE", 
      "MESSAGES_DELETE",
      "CONNECTION_UPDATE"
    ]
  }')

echo "Resposta da configuração do webhook:"
echo "$WEBHOOK_CONFIG" | jq '.' 2>/dev/null || echo "$WEBHOOK_CONFIG"
echo ""

# 4. Verificar configuração do webhook
echo "✅ Verificando configuração do webhook..."
WEBHOOK_STATUS=$(curl -s -X GET \
  "$API_URL/webhook/find/$INSTANCE_NAME" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json")

echo "Status atual do webhook:"
echo "$WEBHOOK_STATUS" | jq '.' 2>/dev/null || echo "$WEBHOOK_STATUS"
echo ""

# 5. Testar conectividade do webhook
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
echo "   1. Envie uma mensagem de teste no WhatsApp para a instância '$INSTANCE_NAME'"
echo "   2. Verifique os logs do Supabase Functions"
echo "   3. Monitore a tabela 'messages' no banco de dados"
echo ""
echo "🔧 Para verificar logs do Supabase:"
echo "   npx supabase functions logs webhook-receiver --follow"