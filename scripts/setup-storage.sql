-- 🔔 SCRIPT PARA CONFIGURAR STORAGE PARA MÍDIA DO WHATSAPP
-- Execute este script no SQL Editor do Supabase Dashboard

-- ========================================
-- PASSO 1: CRIAR BUCKET PARA MÍDIA
-- ========================================

-- Criar bucket para mídia do WhatsApp (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'whatsapp-media',
  'whatsapp-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'audio/wav', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- PASSO 2: CONFIGURAR POLÍTICAS RLS PARA STORAGE
-- ========================================

-- Política para permitir upload de mídia (apenas usuários autenticados)
CREATE POLICY "Permitir upload de mídia para usuários autenticados" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'whatsapp-media' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir visualização pública de mídia
CREATE POLICY "Permitir visualização pública de mídia" ON storage.objects
FOR SELECT USING (
  bucket_id = 'whatsapp-media'
);

-- Política para permitir atualização de mídia (apenas usuários autenticados)
CREATE POLICY "Permitir atualização de mídia para usuários autenticados" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'whatsapp-media' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir exclusão de mídia (apenas usuários autenticados)
CREATE POLICY "Permitir exclusão de mídia para usuários autenticados" ON storage.objects
FOR DELETE USING (
  bucket_id = 'whatsapp-media' AND 
  auth.role() = 'authenticated'
);

-- ========================================
-- PASSO 3: VERIFICAR CONFIGURAÇÃO
-- ========================================

-- Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'whatsapp-media';

-- Verificar políticas criadas
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
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- ✅ Bucket 'whatsapp-media' criado
-- ✅ Políticas RLS configuradas
-- ✅ Upload/visualização de mídia funcionando 