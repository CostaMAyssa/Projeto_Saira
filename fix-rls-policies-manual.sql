-- 🔧 Script para corrigir políticas RLS e resolver erros 406
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos verificar as políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'clients')
ORDER BY tablename, policyname;

-- 2. Criar políticas SELECT para usuários autenticados (resolve erros 406)
CREATE POLICY IF NOT EXISTS "select_messages_authenticated" 
ON messages FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "select_conversations_authenticated" 
ON conversations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "select_clients_authenticated" 
ON clients FOR SELECT 
TO authenticated 
USING (true);

-- 3. Criar políticas INSERT para usuários autenticados
CREATE POLICY IF NOT EXISTS "insert_messages_authenticated" 
ON messages FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "insert_conversations_authenticated" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "insert_clients_authenticated" 
ON clients FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Criar políticas UPDATE para usuários autenticados
CREATE POLICY IF NOT EXISTS "update_messages_authenticated" 
ON messages FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "update_conversations_authenticated" 
ON conversations FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "update_clients_authenticated" 
ON clients FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Verificar se RLS está habilitado (deve estar true)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('messages', 'conversations', 'clients');

-- 6. Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('messages', 'conversations', 'clients')
AND policyname LIKE '%authenticated%'
ORDER BY tablename, policyname;

-- 7. Testar uma consulta simples (deve funcionar sem erro 406)
-- SELECT COUNT(*) FROM messages;
-- SELECT COUNT(*) FROM conversations;
-- SELECT COUNT(*) FROM clients;