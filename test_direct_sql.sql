-- Script para testar diretamente no banco
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há dados nas tabelas
SELECT 'Conversas' as tabela, COUNT(*) as total FROM conversations
UNION ALL
SELECT 'Clientes' as tabela, COUNT(*) as total FROM clients
UNION ALL
SELECT 'Mensagens' as tabela, COUNT(*) as total FROM messages;

-- 2. Mostrar todas as conversas
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
ORDER BY c.started_at DESC;

-- 3. Mostrar todos os clientes
SELECT 
    id,
    name,
    phone,
    email,
    status,
    created_at
FROM clients
ORDER BY created_at DESC;

-- 4. Mostrar todas as mensagens
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
ORDER BY m.sent_at DESC;

-- 5. Verificar RLS policies atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'clients')
ORDER BY tablename, policyname;

-- 6. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages', 'clients')
ORDER BY tablename; 