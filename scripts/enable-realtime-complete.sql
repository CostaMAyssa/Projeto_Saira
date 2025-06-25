-- 🔔 SCRIPT COMPLETO PARA HABILITAR REALTIME
-- Execute este script no SQL Editor do Supabase Dashboard da nova instância

-- ========================================
-- PASSO 1: VERIFICAR TABELAS EXISTENTES
-- ========================================
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'clients', 'chats');

-- ========================================
-- PASSO 2: REMOVER PUBLICATION EXISTENTE
-- ========================================
DROP PUBLICATION IF EXISTS supabase_realtime;

-- ========================================
-- PASSO 3: CRIAR NOVA PUBLICATION
-- ========================================
CREATE PUBLICATION supabase_realtime;

-- ========================================
-- PASSO 4: ADICIONAR TABELAS À PUBLICATION
-- ========================================
-- Adicionar tabelas principais para realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;

-- ========================================
-- PASSO 5: VERIFICAR TABELAS ADICIONADAS
-- ========================================
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ========================================
-- PASSO 6: HABILITAR RLS PARA REALTIME
-- ========================================
-- Habilitar RLS nas tabelas se não estiver habilitado
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PASSO 7: CRIAR POLICIES PARA REALTIME
-- ========================================
-- Policy para conversations
DROP POLICY IF EXISTS "Enable realtime for conversations" ON conversations;
CREATE POLICY "Enable realtime for conversations"
ON conversations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy para messages
DROP POLICY IF EXISTS "Enable realtime for messages" ON messages;
CREATE POLICY "Enable realtime for messages"
ON messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy para clients
DROP POLICY IF EXISTS "Enable realtime for clients" ON clients;
CREATE POLICY "Enable realtime for clients"
ON clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy para chats
DROP POLICY IF EXISTS "Enable realtime for chats" ON chats;
CREATE POLICY "Enable realtime for chats"
ON chats
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ========================================
-- PASSO 8: VERIFICAR STATUS DA REPLICAÇÃO
-- ========================================
SELECT 
    slot_name,
    plugin,
    slot_type,
    datoid,
    active,
    restart_lsn
FROM pg_replication_slots 
WHERE slot_name LIKE '%realtime%';

-- ========================================
-- PASSO 9: VERIFICAR CONFIGURAÇÃO FINAL
-- ========================================
-- Verificar se as tabelas estão na publication
SELECT 
    p.pubname,
    p.puballtables,
    pt.schemaname,
    pt.tablename
FROM pg_publication p
LEFT JOIN pg_publication_tables pt ON p.pubname = pt.pubname
WHERE p.pubname = 'supabase_realtime'
ORDER BY pt.tablename;

-- ========================================
-- PASSO 10: TESTAR INSERÇÃO (OPCIONAL)
-- ========================================
-- Descomente as linhas abaixo para testar se o realtime está funcionando
-- INSERT INTO messages (conversation_id, content, from_me, sent_at) 
-- VALUES ('test-conv-id', 'Teste realtime', false, NOW());

-- ✅ SCRIPT EXECUTADO COM SUCESSO!
-- ✅ Realtime habilitado para: conversations, messages, clients, chats
-- 🔔 Agora as tabelas devem aparecer no painel Realtime do Supabase 