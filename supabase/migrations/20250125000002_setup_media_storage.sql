-- Configuração do Supabase Storage para mídias do WhatsApp
-- Criar bucket e policies para armazenamento de arquivos

-- Criar bucket para mídias do WhatsApp (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'whatsapp-media', 
  'whatsapp-media', 
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav',
    'video/mp4', 'video/mpeg', 'video/quicktime',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Policy para leitura pública dos arquivos
CREATE POLICY IF NOT EXISTS "Public read access for whatsapp media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'whatsapp-media');

-- Policy para upload de arquivos (apenas usuários autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated upload for whatsapp media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'whatsapp-media' 
  AND auth.role() = 'authenticated'
);

-- Policy para deletar arquivos (apenas usuários autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated delete for whatsapp media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'whatsapp-media' 
  AND auth.role() = 'authenticated'
);

-- Policy para atualizar arquivos (apenas usuários autenticados)
CREATE POLICY IF NOT EXISTS "Authenticated update for whatsapp media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'whatsapp-media' 
  AND auth.role() = 'authenticated'
);

-- Habilitar RLS no bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
