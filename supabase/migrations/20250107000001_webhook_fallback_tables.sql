-- 🔧 CORREÇÃO 9: Tabelas para sistema de fallback webhook
-- Tabela para armazenar eventos recebidos via webhook
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR NOT NULL,
    instance_name VARCHAR NOT NULL,
    data JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_instance ON public.webhook_events(instance_name);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed_at);

-- Tabela para status das instâncias
CREATE TABLE IF NOT EXISTS public.instance_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_name VARCHAR UNIQUE NOT NULL,
    connection_state VARCHAR NOT NULL,
    last_disconnect JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para instance_name
CREATE INDEX IF NOT EXISTS idx_instance_status_name ON public.instance_status(instance_name);

-- Tabela para QR codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_name VARCHAR UNIQUE NOT NULL,
    qr_code TEXT NOT NULL,
    base64 TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para instance_name
CREATE INDEX IF NOT EXISTS idx_qr_codes_name ON public.qr_codes(instance_name);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires ON public.qr_codes(expires_at);

-- Comentários nas tabelas
COMMENT ON TABLE public.webhook_events IS 'Eventos recebidos via webhook da Evolution API (fallback do WebSocket)';
COMMENT ON TABLE public.instance_status IS 'Status atual das instâncias do WhatsApp';
COMMENT ON TABLE public.qr_codes IS 'QR codes para conexão das instâncias';

-- RLS (Row Level Security) - mesmo padrão das outras tabelas
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instance_status ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir acesso público para webhook endpoint)
CREATE POLICY "Permitir inserção pública de eventos webhook" ON public.webhook_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de eventos webhook" ON public.webhook_events
    FOR SELECT USING (true);

CREATE POLICY "Permitir upsert público de status instância" ON public.instance_status
    FOR ALL WITH CHECK (true);

CREATE POLICY "Permitir upsert público de QR codes" ON public.qr_codes
    FOR ALL WITH CHECK (true);

-- Função para limpeza automática de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_webhook_data()
RETURNS void AS $$
BEGIN
    -- Remover eventos webhook com mais de 7 dias
    DELETE FROM public.webhook_events 
    WHERE processed_at < NOW() - INTERVAL '7 days';
    
    -- Remover QR codes expirados
    DELETE FROM public.qr_codes 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql; 