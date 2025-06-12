-- 🧪 SCRIPT PARA CRIAR DADOS DE TESTE E VERIFICAR FUNCIONAMENTO
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as tabelas existem
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('chats', 'messages', 'unified_conversations', 'settings')
ORDER BY table_name, ordinal_position;

-- 2. Aplicar migrações se necessário
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_id VARCHAR,
ADD COLUMN IF NOT EXISTS from_me BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS timestamp VARCHAR,
ADD COLUMN IF NOT EXISTS remote_jid VARCHAR,
ADD COLUMN IF NOT EXISTS instance_name VARCHAR,
ADD COLUMN IF NOT EXISTS message_type VARCHAR DEFAULT 'text',
ADD COLUMN IF NOT EXISTS push_name VARCHAR,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON public.messages(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- 4. Limpar dados de teste antigos
DELETE FROM public.messages WHERE content LIKE '%TESTE%';
DELETE FROM public.chats WHERE name LIKE '%Teste%';

-- 5. Inserir dados de teste
INSERT INTO public.chats (id, phone_number, name, status, started_at, last_message_at, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '5511999999999', 'Cliente Teste 1', 'active', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '5 minutes', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', '5511888888888', 'Cliente Teste 2', 'active', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '10 minutes', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    last_message_at = EXCLUDED.last_message_at,
    updated_at = NOW();

-- 6. Inserir mensagens de teste
INSERT INTO public.messages (
    id, 
    conversation_id, 
    content, 
    sender, 
    sent_at, 
    message_id, 
    from_me, 
    timestamp, 
    instance_name,
    created_at, 
    updated_at
)
VALUES 
    -- Conversa 1
    ('msg-001', '550e8400-e29b-41d4-a716-446655440001', 'Olá! Gostaria de saber sobre medicamentos para pressão alta - TESTE', 'client', NOW() - INTERVAL '30 minutes', 'evo-msg-001', false, '14:30', 'default', NOW(), NOW()),
    ('msg-002', '550e8400-e29b-41d4-a716-446655440001', 'Olá! Temos várias opções disponíveis. Você tem receita médica? - TESTE', 'user', NOW() - INTERVAL '25 minutes', 'evo-msg-002', true, '14:35', 'default', NOW(), NOW()),
    ('msg-003', '550e8400-e29b-41d4-a716-446655440001', 'Sim, tenho receita. Qual o preço da Losartana 50mg? - TESTE', 'client', NOW() - INTERVAL '20 minutes', 'evo-msg-003', false, '14:40', 'default', NOW(), NOW()),
    ('msg-004', '550e8400-e29b-41d4-a716-446655440001', 'A Losartana 50mg custa R$ 25,90. Temos em estoque! - TESTE', 'user', NOW() - INTERVAL '15 minutes', 'evo-msg-004', true, '14:45', 'default', NOW(), NOW()),
    
    -- Conversa 2
    ('msg-005', '550e8400-e29b-41d4-a716-446655440002', 'Boa tarde! Vocês fazem entrega? - TESTE', 'client', NOW() - INTERVAL '10 minutes', 'evo-msg-005', false, '14:50', 'default', NOW(), NOW()),
    ('msg-006', '550e8400-e29b-41d4-a716-446655440002', 'Boa tarde! Sim, fazemos entrega em toda a cidade. Taxa de R$ 5,00 - TESTE', 'user', NOW() - INTERVAL '5 minutes', 'evo-msg-006', true, '14:55', 'default', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = NOW();

-- 7. Verificar se os dados foram inseridos
SELECT 'CHATS CRIADOS:' as tipo, COUNT(*) as quantidade FROM public.chats WHERE name LIKE '%Teste%'
UNION ALL
SELECT 'MENSAGENS CRIADAS:' as tipo, COUNT(*) as quantidade FROM public.messages WHERE content LIKE '%TESTE%'
UNION ALL
SELECT 'UNIFIED_CONVERSATIONS:' as tipo, COUNT(*) as quantidade FROM public.unified_conversations;

-- 8. Mostrar estrutura das conversas
SELECT 
    c.id,
    c.name,
    c.phone_number,
    c.last_message_at,
    COUNT(m.id) as total_messages
FROM public.chats c
LEFT JOIN public.messages m ON c.id = m.conversation_id
WHERE c.name LIKE '%Teste%'
GROUP BY c.id, c.name, c.phone_number, c.last_message_at
ORDER BY c.last_message_at DESC;

-- 9. Mostrar mensagens por conversa
SELECT 
    m.conversation_id,
    c.name as conversa_nome,
    m.content,
    m.sender,
    m.from_me,
    m.sent_at,
    m.timestamp
FROM public.messages m
JOIN public.chats c ON m.conversation_id = c.id
WHERE m.content LIKE '%TESTE%'
ORDER BY m.sent_at ASC;

-- 10. Verificar se a view unified_conversations está funcionando
SELECT * FROM public.unified_conversations WHERE name LIKE '%Teste%' LIMIT 5;

SELECT 'Dados de teste criados com sucesso! ✅' as status; 