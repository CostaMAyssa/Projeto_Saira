-- 🔍 DIAGNÓSTICO COMPLETO DO REALTIME
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- ========================================
SELECT 
    'Tabelas existentes' as check_type,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'clients', 'chats')
ORDER BY table_name;

-- ========================================
-- 2. VERIFICAR PUBLICATIONS EXISTENTES
-- ========================================
SELECT 
    'Publications existentes' as check_type,
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication
ORDER BY pubname;

-- ========================================
-- 3. VERIFICAR TABELAS NA PUBLICATION
-- ========================================
SELECT 
    'Tabelas na publication' as check_type,
    pt.pubname,
    pt.schemaname,
    pt.tablename
FROM pg_publication_tables pt
WHERE pt.pubname = 'supabase_realtime'
ORDER BY pt.tablename;

-- ========================================
-- 4. VERIFICAR SLOTS DE REPLICAÇÃO
-- ========================================
SELECT 
    'Slots de replicação' as check_type,
    slot_name,
    plugin,
    slot_type,
    active,
    restart_lsn
FROM pg_replication_slots
WHERE slot_name LIKE '%realtime%';

-- ========================================
-- 5. VERIFICAR RLS NAS TABELAS
-- ========================================
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'clients', 'chats')
ORDER BY tablename;

-- ========================================
-- 6. VERIFICAR POLICIES EXISTENTES
-- ========================================
SELECT 
    'Policies existentes' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'clients', 'chats')
ORDER BY tablename, policyname;

-- ========================================
-- 7. VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================
SELECT 
    'Estrutura conversations' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'conversations'
ORDER BY ordinal_position;

SELECT 
    'Estrutura messages' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messages'
ORDER BY ordinal_position;

-- ========================================
-- 8. VERIFICAR DADOS EXISTENTES
-- ========================================
SELECT 
    'Contagem de dados' as check_type,
    'conversations' as table_name,
    COUNT(*) as row_count
FROM conversations
UNION ALL
SELECT 
    'Contagem de dados' as check_type,
    'messages' as table_name,
    COUNT(*) as row_count
FROM messages
UNION ALL
SELECT 
    'Contagem de dados' as check_type,
    'clients' as table_name,
    COUNT(*) as row_count
FROM clients;

-- ✅ DIAGNÓSTICO COMPLETO
-- Execute este script e verifique os resultados
-- Se alguma tabela não aparecer na publication, execute o script de correção 