-- Script para verificar dados das conversas e identificar problemas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há conversas
SELECT 
    c.id,
    c.client_id,
    c.status,
    c.started_at,
    c.assigned_to,
    cl.name as client_name,
    cl.phone as client_phone
FROM conversations c
LEFT JOIN clients cl ON c.client_id = cl.id
ORDER BY c.started_at DESC
LIMIT 10;

-- 2. Verificar settings do usuário
SELECT 
    user_id,
    api_url,
    api_key,
    evolution_instance_name,
    is_primary,
    instance_status
FROM settings
WHERE user_id = 'fe39cc23-b68b-4526-a514-c92b877cac0c';

-- 3. Verificar se há mensagens
SELECT 
    m.id,
    m.conversation_id,
    m.content,
    m.sender,
    m.sent_at,
    m.message_type,
    c.client_id
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
ORDER BY m.sent_at DESC
LIMIT 10;

-- 4. Verificar RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'clients', 'settings');

-- 5. Testar inserção de conversa de teste
INSERT INTO conversations (client_id, status, started_at, assigned_to)
SELECT 
    cl.id,
    'active',
    NOW(),
    'fe39cc23-b68b-4526-a514-c92b877cac0c'
FROM clients cl
WHERE cl.phone = '556481140676'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 6. Verificar se a conversa foi criada
SELECT 
    c.id,
    c.client_id,
    c.status,
    c.started_at,
    c.assigned_to,
    cl.name as client_name,
    cl.phone as client_phone
FROM conversations c
LEFT JOIN clients cl ON c.client_id = cl.id
WHERE cl.phone = '556481140676'
ORDER BY c.started_at DESC; 