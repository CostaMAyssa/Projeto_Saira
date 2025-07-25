-- Migração super simples: apenas adicionar read_at
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Marcar mensagens existentes como lidas
UPDATE public.messages 
SET read_at = NOW()
WHERE read_at IS NULL;

-- Função simples para marcar como lidas
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.messages 
    SET read_at = NOW()
    WHERE conversation_id = conversation_id_param 
      AND read_at IS NULL 
      AND sender = 'client';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;