-- 🔧 CORREÇÃO: Atualizar tabela messages para suportar estrutura unificada WebSocket + Webhook
-- Adicionar colunas necessárias se não existirem
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_id VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS from_me BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS timestamp VARCHAR,
ADD COLUMN IF NOT EXISTS remote_jid VARCHAR,
ADD COLUMN IF NOT EXISTS instance_name VARCHAR,
ADD COLUMN IF NOT EXISTS message_type VARCHAR DEFAULT 'text',
ADD COLUMN IF NOT EXISTS push_name VARCHAR,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON public.messages(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_me ON public.messages(from_me);
CREATE INDEX IF NOT EXISTS idx_messages_remote_jid ON public.messages(remote_jid);
CREATE INDEX IF NOT EXISTS idx_messages_instance ON public.messages(instance_name);

-- Atualizar constraint para usar message_id como chave única principal
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_message_id_key;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_message_id_unique UNIQUE (message_id);

-- Comentários nas novas colunas
COMMENT ON COLUMN public.messages.message_id IS 'ID único da mensagem da Evolution API';
COMMENT ON COLUMN public.messages.from_me IS 'Indica se a mensagem foi enviada por nós (true) ou recebida (false)';
COMMENT ON COLUMN public.messages.timestamp IS 'Timestamp formatado para exibição (HH:MM)';
COMMENT ON COLUMN public.messages.remote_jid IS 'JID remoto do WhatsApp (identificador da conversa)';
COMMENT ON COLUMN public.messages.instance_name IS 'Nome da instância Evolution API que processou a mensagem';
COMMENT ON COLUMN public.messages.message_type IS 'Tipo da mensagem (text, image, audio, etc.)';
COMMENT ON COLUMN public.messages.push_name IS 'Nome do contato que enviou a mensagem';
COMMENT ON COLUMN public.messages.raw_data IS 'Dados brutos da mensagem da Evolution API para debugging';

-- Função para migrar dados existentes (se houver)
CREATE OR REPLACE FUNCTION migrate_existing_messages()
RETURNS void AS $$
BEGIN
    -- Atualizar registros existentes que não têm message_id
    UPDATE public.messages 
    SET message_id = id::text,
        from_me = (sender = 'user'),
        timestamp = TO_CHAR(sent_at, 'HH24:MI')
    WHERE message_id IS NULL;
    
    RAISE NOTICE 'Migração de mensagens existentes concluída';
END;
$$ LANGUAGE plpgsql;

-- Executar migração
SELECT migrate_existing_messages(); 