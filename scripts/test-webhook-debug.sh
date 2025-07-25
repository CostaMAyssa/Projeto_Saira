#!/bin/bash

echo "🔍 === SCRIPT DE DEBUG DO WEBHOOK ==="
echo ""

# Verificar se o Supabase está rodando
echo "1. Verificando status do Supabase..."
npx supabase status

echo ""
echo "2. Verificando estrutura da tabela settings..."
npx supabase db shell --command "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'settings' ORDER BY ordinal_position;"

echo ""
echo "3. Verificando dados na tabela settings..."
npx supabase db shell --command "SELECT id, user_id, evolution_instance_name, api_url FROM settings LIMIT 5;"

echo ""
echo "4. Verificando estrutura da tabela messages..."
npx supabase db shell --command "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'messages' ORDER BY ordinal_position;"

echo ""
echo "5. Verificando se há usuários na tabela auth.users..."
npx supabase db shell --command "SELECT id, email FROM auth.users LIMIT 3;"

echo ""
echo "6. Testando webhook com payload simples..."

# Payload de teste simples
WEBHOOK_URL="http://localhost:54321/functions/v1/webhook-receiver"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(npx supabase functions get-token)" \
  -d '{
    "instance": "caldasIA",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "test_message_123"
      },
      "pushName": "Teste Debug",
      "message": {
        "conversation": "Mensagem de teste para debug"
      },
      "messageTimestamp": 1640995200
    }
  }'

echo ""
echo ""
echo "7. Verificando logs da função webhook-receiver..."
npx supabase functions logs webhook-receiver --limit 20

echo ""
echo "8. Verificando se a mensagem foi inserida..."
npx supabase db shell --command "SELECT id, content, sender, conversation_id, created_at FROM messages ORDER BY created_at DESC LIMIT 3;"

echo ""
echo "🏁 === FIM DO DEBUG ==="