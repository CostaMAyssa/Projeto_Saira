#!/bin/bash

echo "🚨 CORREÇÃO URGENTE: Webhook com dados corrompidos detectado!"
echo "📊 Análise dos logs mostra que a Evolution API está enviando JSON malformado"
echo ""

# Configurações corretas da Evolution API da Saira
API_KEY="33cf7bf9876391ff485115742bdb149a"
BASE_URL="https://evoapi.insignemarketing.com.br"
INSTANCE_NAME="chat saira "
INSTANCE_NAME_ENCODED="chat%20saira"
WEBHOOK_URL="https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver"

echo "🔧 PASSO 1: Desabilitando webhook atual (pode estar corrompido)..."
curl -X DELETE "${BASE_URL}/webhook/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "⏳ PASSO 2: Aguardando 5 segundos para limpeza..."
sleep 5

echo "🔄 PASSO 3: Reiniciando a instância para limpar cache..."
curl -X PUT "${BASE_URL}/instance/restart/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "⏳ PASSO 4: Aguardando 10 segundos para reinicialização..."
sleep 10

echo "🔍 PASSO 5: Verificando status da instância..."
curl -X GET "${BASE_URL}/instance/connectionState/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🔧 PASSO 6: Reconfigurando webhook com configurações limpas..."
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
        "CONNECTION_UPDATE"
      ]
    }
  }'

echo ""
echo ""
echo "✅ PASSO 7: Verificando configuração final..."
curl -X GET "${BASE_URL}/webhook/find/${INSTANCE_NAME_ENCODED}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${API_KEY}"

echo ""
echo ""
echo "🧪 PASSO 8: Testando webhook com mensagem simulada..."
curl -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc" \
  -d '{
    "instance": "chat saira",
    "data": {
      "key": {
        "remoteJid": "5564920194270@s.whatsapp.net",
        "fromMe": false,
        "id": "test_fix_corruption_'$(date +%s)'"
      },
      "pushName": "Teste Correção",
      "message": {
        "conversation": "🔧 Teste após correção do webhook - '$(date)'"
      },
      "messageTimestamp": '$(date +%s)'
    }
  }'

echo ""
echo ""
echo "🎯 CORREÇÃO CONCLUÍDA!"
echo "📋 RESUMO DO PROBLEMA:"
echo "   ❌ Evolution API estava enviando JSON malformado"
echo "   ❌ Webhooks chegavam com 'Payload completo: undefined'"
echo "   ❌ Erro: 'Unterminated string in JSON at position 120'"
echo ""
echo "🔧 AÇÕES REALIZADAS:"
echo "   ✅ Webhook desabilitado e limpo"
echo "   ✅ Instância reiniciada para limpar cache"
echo "   ✅ Webhook reconfigurado com configurações limpas"
echo "   ✅ Teste realizado"
echo ""
echo "🧪 PRÓXIMOS PASSOS:"
echo "   1. Peça para a Mayssa enviar uma mensagem de teste"
echo "   2. Verifique se aparece nos logs do Supabase"
echo "   3. Confirme se a mensagem chega no chat da aplicação"
echo ""
echo "📞 Se o problema persistir, pode ser necessário:"
echo "   - Verificar configurações de rede da Evolution API"
echo "   - Contatar suporte da Evolution API"
echo "   - Verificar logs do servidor da Evolution API"