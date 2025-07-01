-- 🎯 SCRIPT SIMPLIFICADO - APENAS COLUNAS DA TABELA MESSAGES
-- Execute este script no SQL Editor do Supabase Dashboard

-- =====================================================
-- 1. ADICIONAR COLUNAS PARA MÍDIA NA TABELA MESSAGES
-- =====================================================

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS transcription TEXT,
ADD COLUMN IF NOT EXISTS caption TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_type ON messages(conversation_id, message_type);

-- =====================================================
-- 2. VERIFICAR SE FUNCIONOU
-- =====================================================

-- Verificar colunas adicionadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('message_type', 'media_url', 'media_type', 'file_name', 'file_size', 'transcription', 'caption')
ORDER BY column_name;

-- =====================================================
-- 3. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN messages.message_type IS 'Tipo da mensagem: text, image, audio, document';
COMMENT ON COLUMN messages.media_url IS 'URL do arquivo de mídia no Supabase Storage';
COMMENT ON COLUMN messages.media_type IS 'MIME type do arquivo (image/jpeg, audio/ogg, etc.)';
COMMENT ON COLUMN messages.file_name IS 'Nome original do arquivo';
COMMENT ON COLUMN messages.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN messages.transcription IS 'Transcrição de áudio para texto (OpenAI Whisper)';
COMMENT ON COLUMN messages.caption IS 'Legenda que acompanha imagens/vídeos';

-- ✅ CONCLUÍDO! Colunas adicionadas com sucesso
-- O Storage será configurado manualmente via Dashboard do Supabase 