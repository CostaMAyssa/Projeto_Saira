-- Script para corrigir dados das conversas e resolver problemas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar e corrigir RLS policies para conversations
DROP POLICY IF EXISTS "Users can view conversations they are assigned to" ON conversations;
DROP POLICY IF EXISTS "Users can view all conversations if admin" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they are assigned to" ON conversations;

-- Recriar policies corretas
CREATE POLICY "Users can view conversations they are assigned to" ON conversations
    FOR SELECT USING (
        assigned_to = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view all conversations if admin" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update conversations they are assigned to" ON conversations
    FOR UPDATE USING (
        assigned_to = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Verificar e corrigir RLS policies para messages
DROP POLICY IF EXISTS "Users can view messages from assigned conversations" ON messages;
DROP POLICY IF EXISTS "Users can view all messages if admin" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

CREATE POLICY "Users can view messages from assigned conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id 
            AND (c.assigned_to = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM user_roles 
                    WHERE user_id = auth.uid() AND role = 'admin'
                ))
        )
    );

CREATE POLICY "Users can view all messages if admin" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (true);

-- 3. Verificar e corrigir RLS policies para clients
DROP POLICY IF EXISTS "Users can view clients" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;

CREATE POLICY "Users can view clients" ON clients
    FOR SELECT USING (true);

CREATE POLICY "Users can insert clients" ON clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update clients" ON clients
    FOR UPDATE USING (true);

-- 4. Verificar e corrigir RLS policies para settings
DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON settings;

CREATE POLICY "Users can view their own settings" ON settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON settings
    FOR UPDATE USING (user_id = auth.uid());

-- 5. Garantir que o usuário tem role de admin
INSERT INTO user_roles (user_id, role, created_at)
VALUES ('fe39cc23-b68b-4526-a514-c92b877cac0c', 'admin', NOW())
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Garantir que há uma conversa para o cliente
INSERT INTO conversations (client_id, status, started_at, assigned_to)
SELECT 
    cl.id,
    'active',
    NOW(),
    'fe39cc23-b68b-4526-a514-c92b877cac0c'
FROM clients cl
WHERE cl.phone = '556481140676'
AND NOT EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.client_id = cl.id 
    AND c.assigned_to = 'fe39cc23-b68b-4526-a514-c92b877cac0c'
)
LIMIT 1;

-- 7. Verificar se tudo está funcionando
SELECT 
    'Conversas' as tabela,
    COUNT(*) as total
FROM conversations
UNION ALL
SELECT 
    'Mensagens' as tabela,
    COUNT(*) as total
FROM messages
UNION ALL
SELECT 
    'Clientes' as tabela,
    COUNT(*) as total
FROM clients
UNION ALL
SELECT 
    'Settings' as tabela,
    COUNT(*) as total
FROM settings
WHERE user_id = 'fe39cc23-b68b-4526-a514-c92b877cac0c'; 