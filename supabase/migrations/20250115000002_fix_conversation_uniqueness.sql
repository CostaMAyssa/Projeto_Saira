-- Garantir que cada cliente tenha apenas uma conversa ativa
-- Data: 2025-01-15
-- Descrição: Adiciona constraint única para evitar múltiplas conversas por cliente

-- 1. Remover conversas duplicadas (manter apenas a mais recente por cliente)
DELETE FROM conversations 
WHERE id NOT IN (
  SELECT DISTINCT ON (client_id) id 
  FROM conversations 
  ORDER BY client_id, started_at DESC
);

-- 2. Adicionar constraint única para client_id
-- Primeiro, remover a constraint se ela já existir
ALTER TABLE conversations 
DROP CONSTRAINT IF EXISTS conversations_client_id_unique;

-- Adicionar a constraint única
ALTER TABLE conversations 
ADD CONSTRAINT conversations_client_id_unique 
UNIQUE (client_id);

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id_unique 
ON conversations(client_id);

-- 4. Adicionar comentário para documentação
COMMENT ON CONSTRAINT conversations_client_id_unique ON conversations 
IS 'Garante que cada cliente tenha apenas uma conversa ativa, como no WhatsApp';

-- 5. Atualizar a view unified_conversations para refletir a mudança
DROP VIEW IF EXISTS unified_conversations;

CREATE OR REPLACE VIEW unified_conversations AS 
SELECT 
    c.id,
    cl.phone as phone_number,
    cl.name,
    c.last_message_at,
    c.status,
    c.started_at,
    c.started_at as created_at
FROM conversations c
LEFT JOIN clients cl ON c.client_id = cl.id
WHERE c.status = 'active'
ORDER BY c.last_message_at DESC; 