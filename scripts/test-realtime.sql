-- 🔔 SCRIPT PARA VERIFICAR E CONFIGURAR REALTIME
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- PASSO 1: VERIFICAR PUBLICATION ATUAL
-- ========================================
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ========================================
-- PASSO 2: VERIFICAR SE AS TABELAS EXISTEM
-- ========================================
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'clients')
ORDER BY table_name;

-- ========================================
-- PASSO 3: RECONFIGURAR REALTIME (se necessário)
-- ========================================
-- Remover publication existente
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Criar nova publication
CREATE PUBLICATION supabase_realtime;

-- Adicionar tabelas à publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;

-- ========================================
-- PASSO 4: VERIFICAR CONFIGURAÇÃO FINAL
-- ========================================
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ========================================
-- PASSO 5: VERIFICAR STATUS DA REPLICAÇÃO
-- ========================================
SELECT 
    slot_name,
    plugin,
    slot_type,
    datoid,
    active
FROM pg_replication_slots 
WHERE slot_name LIKE '%realtime%';

-- ========================================
-- PASSO 6: TESTAR INSERÇÃO (OPCIONAL)
-- ========================================
-- Inserir uma mensagem de teste para verificar se o realtime funciona
INSERT INTO messages (conversation_id, content, sender, sent_at, message_type) 
VALUES (
    '70ccc69c-a83e-4004-b089-a177d38de321', -- ID da conversa que já existe
    'Teste Realtime - ' || NOW()::text,
    'client',
    NOW(),
    'text'
);

-- Verificar se a mensagem foi inserida
SELECT 
    id,
    conversation_id,
    content,
    sender,
    sent_at
FROM messages 
WHERE conversation_id = '70ccc69c-a83e-4004-b089-a177d38de321'
ORDER BY sent_at DESC
LIMIT 5;

-- ✅ SCRIPT EXECUTADO COM SUCESSO!
-- ✅ Realtime deve estar funcionando para: conversations, messages, clients 