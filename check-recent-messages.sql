-- Verificar mensagens recentes (últimas 2 horas)
SELECT 
  m.id,
  m.content,
  m.message_type,
  m.sender,
  m.media_url,
  m.sent_at,
  m.from_me,
  m.push_name,
  c.name as client_name,
  c.phone as client_phone
FROM messages m
JOIN conversations conv ON m.conversation_id = conv.id
JOIN clients c ON conv.client_id = c.id
WHERE m.sent_at >= NOW() - INTERVAL '2 hours'
ORDER BY m.sent_at DESC
LIMIT 20;

-- Verificar se há mensagens de hoje às 16:06
SELECT 
  m.id,
  m.content,
  m.message_type,
  m.sender,
  m.media_url,
  m.sent_at,
  m.from_me,
  m.push_name
FROM messages m
WHERE DATE(m.sent_at) = CURRENT_DATE
  AND EXTRACT(hour FROM m.sent_at) = 16
  AND EXTRACT(minute FROM m.sent_at) = 6
ORDER BY m.sent_at DESC;