-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA FRONTEND
-- =====================================================

-- O problema: Frontend está recebendo erro 406 porque não tem permissão para SELECT
-- Solução: Adicionar políticas de SELECT para usuários autenticados

-- 1. Política para SELECT em messages (usuários autenticados)
DROP POLICY IF EXISTS "Allow authenticated users to read messages" ON messages;
CREATE POLICY "Allow authenticated users to read messages" ON messages
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Política para SELECT em conversations (usuários autenticados)
DROP POLICY IF EXISTS "Allow authenticated users to read conversations" ON conversations;
CREATE POLICY "Allow authenticated users to read conversations" ON conversations
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 3. Política para SELECT em clients (usuários autenticados)
DROP POLICY IF EXISTS "Allow authenticated users to read clients" ON clients;
CREATE POLICY "Allow authenticated users to read clients" ON clients
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 4. Política para UPDATE em messages (usuários autenticados)
DROP POLICY IF EXISTS "Allow authenticated users to update messages" ON messages;
CREATE POLICY "Allow authenticated users to update messages" ON messages
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 5. Política para UPDATE em conversations (usuários autenticados)
DROP POLICY IF EXISTS "Allow authenticated users to update conversations" ON conversations;
CREATE POLICY "Allow authenticated users to update conversations" ON conversations
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 6. Política para INSERT em messages (usuários autenticados)
DROP POLICY IF EXISTS "Allow authenticated users to insert messages" ON messages;
CREATE POLICY "Allow authenticated users to insert messages" ON messages
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 7. Verificar se as políticas foram criadas
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename IN ('clients', 'conversations', 'messages')
AND policyname LIKE '%authenticated%'
ORDER BY tablename, policyname;

-- 8. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('clients', 'conversations', 'messages')
AND schemaname = 'public';