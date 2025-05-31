-- Corrige as inconsistências das tabelas de chat

-- 1. Ajustar a tabela messages para ter os campos corretos
ALTER TABLE messages 
DROP COLUMN IF EXISTS chat_id,
ADD COLUMN IF NOT EXISTS conversation_id UUID,
DROP COLUMN IF EXISTS is_from_me,
ADD COLUMN IF NOT EXISTS sender TEXT CHECK (sender IN ('user', 'client')),
DROP COLUMN IF EXISTS timestamp,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. Criar índices para os novos campos (só se não existirem)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);

-- Remover índices antigos se existirem
DROP INDEX IF EXISTS idx_messages_chat_id;
DROP INDEX IF EXISTS idx_messages_timestamp;

-- 3. Adicionar campos necessários à tabela chats para compatibilidade
ALTER TABLE chats
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 4. Criar uma view para unificar conversations e chats
CREATE OR REPLACE VIEW unified_conversations AS 
SELECT 
    c.id,
    c.phone_number,
    c.name,
    c.last_message_at,
    c.status,
    c.started_at,
    c.created_at
FROM chats c
UNION ALL
SELECT 
    conv.id,
    cl.phone as phone_number,
    cl.name,
    conv.started_at as last_message_at,
    conv.status,
    conv.started_at,
    conv.started_at as created_at
FROM conversations conv
LEFT JOIN clients cl ON conv.client_id = cl.id;

-- 5. Atualizar a tabela settings para garantir que tenha os campos corretos
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS api_url TEXT,
ADD COLUMN IF NOT EXISTS api_key TEXT,
ADD COLUMN IF NOT EXISTS instance_name TEXT;

-- Renomear colunas antigas se existirem (com mais verificações)
DO $$ 
BEGIN
    -- Verificar e migrar evolution_api_url
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='evolution_api_url') THEN
        UPDATE settings SET api_url = evolution_api_url WHERE api_url IS NULL OR api_url = '';
        ALTER TABLE settings DROP COLUMN evolution_api_url;
    END IF;
    
    -- Verificar e migrar evolution_api_key
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='evolution_api_key') THEN
        UPDATE settings SET api_key = evolution_api_key WHERE api_key IS NULL OR api_key = '';
        ALTER TABLE settings DROP COLUMN evolution_api_key;
    END IF;
    
    -- Verificar e migrar instance_name se existir campo antigo
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='evolution_instance_name') THEN
        UPDATE settings SET instance_name = evolution_instance_name WHERE instance_name IS NULL OR instance_name = '';
        ALTER TABLE settings DROP COLUMN evolution_instance_name;
    END IF;
END $$;

-- 6. Função para sincronizar mensagens entre sistemas
CREATE OR REPLACE FUNCTION sync_chat_messages()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando inserir uma mensagem, atualizar last_message_at no chat
    IF TG_OP = 'INSERT' THEN
        UPDATE chats 
        SET last_message_at = NEW.sent_at 
        WHERE id = NEW.conversation_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Remover triggers antigos e criar novos
DROP TRIGGER IF EXISTS trigger_sync_chat_messages ON messages;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;

-- Recriar trigger para sincronização
CREATE TRIGGER trigger_sync_chat_messages
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION sync_chat_messages();

-- Recriar triggers de updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 