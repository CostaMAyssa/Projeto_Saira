#!/bin/bash

echo "🧪 Teste Simples do Webhook"
echo ""

# 1. Primeiro, vamos inserir dados de teste no banco
echo "1. Inserindo dados de teste..."

# Inserir um usuário de teste (se não existir)
npx supabase db shell --command "
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'teste@exemplo.com',
  'senha_hash',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
"

# Inserir configuração de teste
npx supabase db shell --command "
INSERT INTO settings (
  id,
  user_id,
  evolution_instance_name,
  api_url,
  api_key,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'caldasIA',
  'http://localhost:8080',
  'test-key',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
"

# Inserir cliente de teste
npx supabase db shell --command "
INSERT INTO clients (
  id,
  name,
  phone,
  status,
  created_by,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Cliente Teste',
  '5511999999999',
  'ativo',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
"

# Inserir conversa de teste
npx supabase db shell --command "
INSERT INTO conversations (
  id,
  client_id,
  status,
  assigned_to,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'active',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
"

echo "✅ Dados de teste inseridos"
echo ""

# 2. Testar o webhook
echo "2. Testando webhook..."

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
        "id": "test_message_simple"
      },
      "pushName": "Cliente Teste",
      "message": {
        "conversation": "Olá, esta é uma mensagem de teste!"
      },
      "messageTimestamp": 1640995200
    }
  }'

echo ""
echo ""

# 3. Verificar se a mensagem foi inserida
echo "3. Verificando mensagens inseridas..."
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
LIMIT 3;
"

echo ""
echo "4. Verificando logs da função..."
npx supabase functions logs webhook-receiver --limit 5

echo ""
echo "🏁 Teste concluído!"