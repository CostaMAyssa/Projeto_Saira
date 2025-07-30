#!/bin/bash

echo "🧪 Testando Webhook do Supabase..."

# Simular uma mensagem recebida
curl -X POST https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTI5NzQsImV4cCI6MjA1MDEyODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8" \
  -d '{
    "instance": "green-pharmacy",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "test_message_123"
      },
      "pushName": "Teste Cliente",
      "message": {
        "conversation": "Olá, esta é uma mensagem de teste!"
      },
      "messageTimestamp": '$(date +%s)'
    }
  }'

echo ""
echo "✅ Teste enviado! Verifique os logs do Supabase."
echo ""
echo "🔍 Para verificar se funcionou:"
echo "1. Acesse o Supabase Dashboard"
echo "2. Vá em Functions > webhook-receiver > Logs"
echo "3. Verifique se a mensagem foi processada"
echo ""
echo "📊 Também verifique as tabelas:"
echo "- clients (novo cliente deve ter sido criado)"
echo "- conversations (nova conversa deve ter sido criada)"
echo "- messages (nova mensagem deve ter sido inserida)"