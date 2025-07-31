-- Verificar conversas existentes
SELECT 
  c.id as conversation_id,
  c.client_id,
  cl.name as client_name,
  cl.phone as client_phone,
  c.assigned_to as user_id,
  COUNT(m.id) as message_count
FROM conversations c
JOIN clients cl ON c.client_id = cl.id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.client_id, cl.name, cl.phone, c.assigned_to
ORDER BY c.created_at DESC
LIMIT 5;

-- Verificar mensagens recentes
SELECT 
  m.id,
  m.conversation_id,
  m.content,
  m.sender,
  m.sent_at,
  m.from_me
FROM messages m
ORDER BY m.sent_at DESC
LIMIT 10;