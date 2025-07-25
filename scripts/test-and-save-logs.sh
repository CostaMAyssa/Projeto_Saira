#!/bin/bash

echo "🔍 Testando webhook e salvando logs..."

# Criar diretório para logs se não existir
mkdir -p logs

# 1. Testar webhook
echo "1. Testando webhook..."
curl -X POST "http://localhost:54321/functions/v1/webhook-receiver" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(npx supabase functions get-token)" \
  -d '{
    "instance": "caldasIA",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "test_with_logs"
      },
      "pushName": "Teste com Logs",
      "message": {
        "conversation": "Mensagem de teste para verificar logs"
      },
      "messageTimestamp": 1640995200
    }
  }' > logs/webhook_response.txt 2>&1

echo "✅ Resposta do webhook salva em logs/webhook_response.txt"

# 2. Aguardar um pouco e capturar logs
sleep 2
echo "2. Capturando logs da função..."
npx supabase functions logs webhook-receiver --limit 10 > logs/function_logs.txt 2>&1

echo "✅ Logs da função salvos em logs/function_logs.txt"

# 3. Verificar mensagens no banco
echo "3. Verificando mensagens no banco..."
npx supabase db shell --command "
SELECT 
  id, 
  content, 
  sender, 
  message_type,
  conversation_id,
  created_at 
FROM messages 
WHERE content LIKE '%teste%' 
ORDER BY created_at DESC 
LIMIT 5;
" > logs/database_messages.txt 2>&1

echo "✅ Mensagens do banco salvas em logs/database_messages.txt"

# 4. Verificar configurações
echo "4. Verificando configurações..."
npx supabase db shell --command "
SELECT 
  id,
  user_id,
  evolution_instance_name,
  instance_name,
  api_url
FROM settings 
LIMIT 5;
" > logs/settings_data.txt 2>&1

echo "✅ Configurações salvas em logs/settings_data.txt"

echo ""
echo "🏁 Teste concluído! Verifique os arquivos na pasta logs/"
echo "   - logs/webhook_response.txt"
echo "   - logs/function_logs.txt" 
echo "   - logs/database_messages.txt"
echo "   - logs/settings_data.txt"