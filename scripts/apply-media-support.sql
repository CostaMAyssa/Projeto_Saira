-- 🎯 SCRIPT COMPLETO PARA SUPORTE A MÍDIA NO WHATSAPP
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
-- 2. CONFIGURAR SUPABASE STORAGE
-- =====================================================

-- Criar bucket para mídias do WhatsApp
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'whatsapp-media', 
  'whatsapp-media', 
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/m4a',
    'video/mp4', 'video/mpeg', 'video/quicktime',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CONFIGURAR POLICIES DE SEGURANÇA
-- =====================================================

-- Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública dos arquivos
CREATE POLICY IF NOT EXISTS "Public read access for whatsapp media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'whatsapp-media');

-- Policy para upload (permite qualquer usuário - ajuste conforme necessário)
CREATE POLICY IF NOT EXISTS "Allow upload for whatsapp media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'whatsapp-media');

-- Policy para delete (permite qualquer usuário - ajuste conforme necessário)
CREATE POLICY IF NOT EXISTS "Allow delete for whatsapp media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'whatsapp-media');

-- =====================================================
-- 4. VERIFICAR SE FUNCIONOU
-- =====================================================

-- Verificar colunas adicionadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('message_type', 'media_url', 'media_type', 'file_name', 'file_size', 'transcription', 'caption');

-- Verificar bucket criado
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'whatsapp-media';

-- Verificar policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%whatsapp%';

-- =====================================================
-- 5. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN messages.message_type IS 'Tipo da mensagem: text, image, audio, document';
COMMENT ON COLUMN messages.media_url IS 'URL do arquivo de mídia no Supabase Storage';
COMMENT ON COLUMN messages.media_type IS 'MIME type do arquivo (image/jpeg, audio/ogg, etc.)';
COMMENT ON COLUMN messages.file_name IS 'Nome original do arquivo';
COMMENT ON COLUMN messages.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN messages.transcription IS 'Transcrição de áudio para texto (OpenAI Whisper)';
COMMENT ON COLUMN messages.caption IS 'Legenda que acompanha imagens/vídeos';

-- ✅ CONCLUÍDO! Agora seu Supabase está pronto para mídia do WhatsApp 