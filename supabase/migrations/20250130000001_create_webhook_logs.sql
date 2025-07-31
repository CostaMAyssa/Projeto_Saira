-- Criar tabela para logs do webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'DEBUG')),
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_request_id ON webhook_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_level ON webhook_logs(level);

-- Adicionar RLS (Row Level Security)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de logs (sem autenticação para webhooks)
CREATE POLICY "Allow webhook logs insert" ON webhook_logs
  FOR INSERT
  WITH CHECK (true);

-- Política para leitura de logs (apenas usuários autenticados)
CREATE POLICY "Allow authenticated read webhook logs" ON webhook_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');