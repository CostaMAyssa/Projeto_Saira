-- 🔔 SCRIPT SIMPLES PARA HABILITAR REALTIME
-- Execute este script no SQL Editor do Supabase Dashboard

-- Passo 1: Remover publication existente
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Passo 2: Criar nova publication
CREATE PUBLICATION supabase_realtime;

-- Passo 3: Adicionar tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Passo 4: Verificar se funcionou
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'; 