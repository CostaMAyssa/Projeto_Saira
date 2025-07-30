#!/bin/bash

# 🔧 Script para Verificar e Configurar Webhook com Dados Reais
# Busca as configurações da Evolution API no Supabase e configura o webhook

echo "🚀 Verificando configurações da Evolution API no Supabase..."

# URL do Supabase
SUPABASE_URL="https://svkgfvfhmngcvfsjpero.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc"

echo "📋 Buscando configurações no Supabase..."

# Buscar configurações da Evolution API
SETTINGS_RESPONSE=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/settings?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

echo "Configurações encontradas:"
echo "$SETTINGS_RESPONSE" | jq '.' 2>/dev/null || echo "$SETTINGS_RESPONSE"
echo ""

# Extrair dados da primeira configuração (assumindo que há pelo menos uma)
API_URL=$(echo "$SETTINGS_RESPONSE" | jq -r '.[0].api_url // empty' 2>/dev/null)
API_KEY=$(echo "$SETTINGS_RESPONSE" | jq -r '.[0].api_key // empty' 2>/dev/null)
INSTANCE_NAME=$(echo "$SETTINGS_RESPONSE" | jq -r '.[0].instance_name // empty' 2>/dev/null)

if [ -z "$API_URL" ] || [ -z "$API_KEY" ] || [ -z "$INSTANCE_NAME" ]; then
    echo "❌ Configurações incompletas no banco de dados!"
    echo "   API_URL: $API_URL"
    echo "   API_KEY: $API_KEY"
    echo "   INSTANCE_NAME: $INSTANCE_NAME"
    echo ""
    echo "🔧 Usando configurações padrão do projeto..."
    API_URL="https://evoapi.insignemarketing.com.br"
    API_KEY="B6D711FCDE4D4FD5936544120E713976"
    INSTANCE_NAME="chat saira"
fi

WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "📋 Configurações que serão usadas:"
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

# 2. Configurar webhook da instância
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

# 3. Verificar configuração do webhook
echo "✅ Verificando configuração do webhook..."
WEBHOOK_STATUS=$(curl -s -X GET \
  "$API_URL/webhook/find/$INSTANCE_NAME" \
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
echo "   1. Envie uma mensagem de teste no WhatsApp"
echo "   2. Verifique os logs do Supabase Functions"
echo "   3. Monitore a tabela 'messages' no banco de dados"