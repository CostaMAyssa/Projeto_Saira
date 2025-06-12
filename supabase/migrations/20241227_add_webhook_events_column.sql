-- Adicionar coluna webhook_events na tabela settings para armazenar configurações de eventos
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS webhook_events JSONB DEFAULT '{}';

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.settings.webhook_events IS 'Configurações JSON dos eventos WebSocket habilitados da Evolution API'; 