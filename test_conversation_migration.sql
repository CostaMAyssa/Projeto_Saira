-- Script de teste para verificar a migration de conversas únicas
-- Execute este script no Supabase SQL Editor para testar

-- 1. Verificar estrutura da tabela conversations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
ORDER BY ordinal_position;

-- 2. Verificar se existem conversas duplicadas
SELECT client_id, COUNT(*) as total_conversas
FROM conversations 
GROUP BY client_id 
HAVING COUNT(*) > 1
ORDER BY total_conversas DESC;

-- 3. Testar a query de remoção de duplicatas (sem executar DELETE)
SELECT DISTINCT ON (client_id) id, client_id, started_at
FROM conversations 
ORDER BY client_id, started_at DESC;

-- 4. Verificar se a constraint única já existe
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'conversations' 
AND constraint_type = 'UNIQUE'; 