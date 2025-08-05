-- Melhorar a função mark_messages_as_read com logs e retorno
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Marcar mensagens como lidas
    UPDATE public.messages 
    SET read_at = NOW()
    WHERE conversation_id = conversation_id_param 
      AND read_at IS NULL 
      AND sender = 'client';
    
    -- Retornar quantas mensagens foram marcadas
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Log para debug
    RAISE NOTICE 'Marcadas % mensagens como lidas para conversa %', updated_count, conversation_id_param;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 