-- Corrigir a view unified_conversations e tabelas para resolver erros do dashboard

-- 1. Garantir que as tabelas principais existam com estrutura correta
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    name TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    content TEXT NOT NULL,
    sender TEXT CHECK (sender IN ('user', 'client')) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- 2. Criar índices necessários para performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender);
CREATE INDEX IF NOT EXISTS idx_chats_phone_number ON public.chats(phone_number);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON public.chats(last_message_at);
CREATE INDEX IF NOT EXISTS idx_chats_status ON public.chats(status);

-- 3. Recriar a view unified_conversations corretamente
DROP VIEW IF EXISTS public.unified_conversations;

CREATE OR REPLACE VIEW public.unified_conversations AS 
SELECT 
    c.id,
    c.phone_number,
    c.name,
    c.last_message_at,
    c.status,
    c.started_at,
    c.created_at,
    c.updated_at
FROM public.chats c
WHERE c.status = 'active'
ORDER BY c.last_message_at DESC;

-- 4. Inserir dados de exemplo para testar (apenas se não existirem dados)
INSERT INTO public.chats (phone_number, name, status, started_at, last_message_at)
SELECT '5511999999999', 'Cliente Exemplo', 'active', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM public.chats WHERE phone_number = '5511999999999');

INSERT INTO public.chats (phone_number, name, status, started_at, last_message_at)
SELECT '5511888888888', 'Farmácia Verde', 'active', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '15 minutes'
WHERE NOT EXISTS (SELECT 1 FROM public.chats WHERE phone_number = '5511888888888');

-- 5. Inserir mensagens de exemplo
INSERT INTO public.messages (conversation_id, content, sender, sent_at)
SELECT 
    (SELECT id FROM public.chats WHERE phone_number = '5511999999999' LIMIT 1),
    'Olá, gostaria de saber sobre medicamentos para pressão alta',
    'client',
    NOW() - INTERVAL '30 minutes'
WHERE NOT EXISTS (
    SELECT 1 FROM public.messages m 
    JOIN public.chats c ON m.conversation_id = c.id 
    WHERE c.phone_number = '5511999999999'
);

INSERT INTO public.messages (conversation_id, content, sender, sent_at)
SELECT 
    (SELECT id FROM public.chats WHERE phone_number = '5511999999999' LIMIT 1),
    'Olá! Temos várias opções disponíveis. Você tem receita médica?',
    'user',
    NOW() - INTERVAL '25 minutes'
WHERE NOT EXISTS (
    SELECT 1 FROM public.messages m 
    JOIN public.chats c ON m.conversation_id = c.id 
    WHERE c.phone_number = '5511999999999' AND m.sender = 'user'
);

-- 6. Função para atualizar automaticamente last_message_at quando nova mensagem é inserida
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats 
    SET last_message_at = NEW.sent_at 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para atualizar automaticamente last_message_at
DROP TRIGGER IF EXISTS update_chat_last_message_trigger ON public.messages;
CREATE TRIGGER update_chat_last_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_last_message();

-- 8. Atualizar last_message_at baseado nas mensagens existentes
UPDATE public.chats 
SET last_message_at = (
    SELECT MAX(sent_at) 
    FROM public.messages 
    WHERE conversation_id = chats.id
)
WHERE EXISTS (
    SELECT 1 
    FROM public.messages 
    WHERE conversation_id = chats.id
);

-- 9. Comentários nas tabelas e views
COMMENT ON VIEW public.unified_conversations IS 'View unificada para listar todas as conversas ativas com informações essenciais';
COMMENT ON TABLE public.chats IS 'Tabela principal de conversas/chats do WhatsApp';
COMMENT ON TABLE public.messages IS 'Tabela de mensagens trocadas nas conversas';
COMMENT ON COLUMN public.messages.sender IS 'Quem enviou a mensagem: user (farmácia) ou client (cliente)';
COMMENT ON COLUMN public.chats.status IS 'Status da conversa: active, archived, etc.'; 