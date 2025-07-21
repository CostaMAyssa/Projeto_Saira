-- Script para corrigir RLS policies e permitir acesso aos dados
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para debug
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se os dados estão lá
SELECT 'Conversas' as tabela, COUNT(*) as total FROM conversations
UNION ALL
SELECT 'Clientes' as tabela, COUNT(*) as total FROM clients
UNION ALL
SELECT 'Mensagens' as tabela, COUNT(*) as total FROM messages;

-- 3. Mostrar dados específicos
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

-- 4. Reabilitar RLS com policies mais permissivas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Criar policies mais permissivas
DROP POLICY IF EXISTS "Users can view conversations they are assigned to" ON conversations;
DROP POLICY IF EXISTS "Users can view all conversations if admin" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they are assigned to" ON conversations;

-- Policy para permitir acesso a todas as conversas (temporário para debug)
CREATE POLICY "Allow all access to conversations" ON conversations
    FOR ALL USING (true);

-- 6. Criar policies para clients
DROP POLICY IF EXISTS "Users can view clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;

CREATE POLICY "Allow all access to clients" ON clients
    FOR ALL USING (true);

-- 7. Criar policies para messages
DROP POLICY IF EXISTS "Users can view messages from assigned conversations" ON messages;
DROP POLICY IF EXISTS "Users can view all messages if admin" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

CREATE POLICY "Allow all access to messages" ON messages
    FOR ALL USING (true);

-- 8. Verificar se as policies foram criadas
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