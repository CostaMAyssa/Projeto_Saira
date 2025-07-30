-- Script SQL para verificar mensagens de mídia no banco
-- Execute no Supabase SQL Editor

-- 1. Verificar mensagens de mídia recentes
SELECT 
  id,
  content,
  message_type,
  media_url,
  media_type,
  file_name,
  sender,
  sent_at,
  conversation_id
FROM messages 
WHERE message_type IN ('image', 'audio', 'document')
ORDER BY sent_at DESC 
LIMIT 10;

-- 2. Verificar se há URLs vazias ou nulas
SELECT 
  message_type,
  COUNT(*) as total,
  COUNT(media_url) as with_url,
  COUNT(*) - COUNT(media_url) as without_url
FROM messages 
WHERE message_type IN ('image', 'audio', 'document')
GROUP BY message_type;

-- 3. Verificar mensagens de mídia de clientes (recebidas)
SELECT 
  id,
  content,
  message_type,
  media_url,
  sender,
  sent_at
FROM messages 
WHERE message_type IN ('image', 'audio', 'document')
  AND sender = 'client'
ORDER BY sent_at DESC 
LIMIT 5;