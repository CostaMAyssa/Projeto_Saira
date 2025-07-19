-- =====================================================
-- CONFIGURAÇÃO DE WEBHOOKS PARA EVOLUTION API
-- =====================================================

-- 1. Criar política RLS para permitir inserções de webhooks
-- Esta política permite que a função webhook-receiver insira dados sem autenticação

-- Política para tabela clients (permitir inserção via webhook)
CREATE POLICY "Allow webhook client creation" ON clients
FOR INSERT 
WITH CHECK (true);

-- Política para tabela conversations (permitir inserção via webhook)
CREATE POLICY "Allow webhook conversation creation" ON conversations
FOR INSERT 
WITH CHECK (true);

-- Política para tabela messages (permitir inserção via webhook)
CREATE POLICY "Allow webhook message creation" ON messages
FOR INSERT 
WITH CHECK (true);

-- Política para tabela conversations (permitir update via webhook)
CREATE POLICY "Allow webhook conversation update" ON conversations
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 2. Garantir que o bucket de mídia existe e tem permissões corretas
-- (Execute isso apenas se o bucket não existir)

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('whatsapp-media', 'whatsapp-media', true)
-- ON CONFLICT (id) DO NOTHING;

-- 3. Política para storage (permitir upload via webhook)
CREATE POLICY "Allow webhook media upload" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'whatsapp-media');

-- 4. Política para storage (permitir select via webhook)
CREATE POLICY "Allow webhook media select" ON storage.objects
FOR SELECT 
USING (bucket_id = 'whatsapp-media');

-- 5. Verificar se as colunas necessárias existem na tabela messages
-- Se não existirem, adicionar:

-- ALTER TABLE messages 
-- ADD COLUMN IF NOT EXISTS evolution_message_id TEXT,
-- ADD COLUMN IF NOT EXISTS evolution_instance TEXT;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_messages_evolution_id ON messages(evolution_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_evolution_instance ON messages(evolution_instance);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);

-- 7. Verificar configurações de RLS
-- Certifique-se de que RLS está habilitado nas tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 8. Comentários sobre a configuração
COMMENT ON POLICY "Allow webhook client creation" ON clients IS 'Permite criação de clientes via webhook da Evolution API';
COMMENT ON POLICY "Allow webhook conversation creation" ON conversations IS 'Permite criação de conversas via webhook da Evolution API';
COMMENT ON POLICY "Allow webhook message creation" ON messages IS 'Permite criação de mensagens via webhook da Evolution API';
COMMENT ON POLICY "Allow webhook conversation update" ON conversations IS 'Permite atualização de conversas via webhook da Evolution API';
COMMENT ON POLICY "Allow webhook media upload" ON storage.objects IS 'Permite upload de mídia via webhook da Evolution API';
COMMENT ON POLICY "Allow webhook media select" ON storage.objects IS 'Permite acesso a mídia via webhook da Evolution API';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('clients', 'conversations', 'messages', 'objects')
ORDER BY tablename, policyname; 