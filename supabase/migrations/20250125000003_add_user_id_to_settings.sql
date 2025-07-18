-- Adicionar user_id à tabela settings para suporte a múltiplas instâncias por usuário
-- Esta migração prepara a tabela settings para suportar múltiplas instâncias do WhatsApp por usuário

-- 1. Adicionar coluna user_id se não existir
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Renomear colunas para padronização (se ainda não foram renomeadas)
DO $$ 
BEGIN
    -- Verificar e renomear evolution_api_url para api_url
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='evolution_api_url') THEN
        ALTER TABLE public.settings RENAME COLUMN evolution_api_url TO api_url;
    END IF;
    
    -- Verificar e renomear evolution_api_key para api_key  
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='evolution_api_key') THEN
        ALTER TABLE public.settings RENAME COLUMN evolution_api_key TO api_key;
    END IF;
    
    -- Verificar e renomear instance_name para evolution_instance_name
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='instance_name') THEN
        ALTER TABLE public.settings RENAME COLUMN instance_name TO evolution_instance_name;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        -- Ignorar se as colunas já foram renomeadas
        NULL;
END $$;

-- 3. Adicionar campos específicos para Evolution API se não existirem
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS api_url TEXT,
ADD COLUMN IF NOT EXISTS api_key TEXT,
ADD COLUMN IF NOT EXISTS evolution_instance_name TEXT;

-- 4. Criar índice único para user_id + evolution_instance_name (permitir múltiplas instâncias por usuário)
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_user_instance 
ON public.settings(user_id, evolution_instance_name) 
WHERE user_id IS NOT NULL AND evolution_instance_name IS NOT NULL;

-- 5. Criar índice para user_id para performance
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- 6. Adicionar campos para controle de instâncias
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS instance_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS last_connection TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- 7. Comentários nas colunas
COMMENT ON COLUMN public.settings.user_id IS 'FK para auth.users(id). Usuário dono desta configuração';
COMMENT ON COLUMN public.settings.api_url IS 'URL da Evolution API';
COMMENT ON COLUMN public.settings.api_key IS 'Chave de autenticação da Evolution API';
COMMENT ON COLUMN public.settings.evolution_instance_name IS 'Nome da instância do WhatsApp';
COMMENT ON COLUMN public.settings.instance_status IS 'Status atual da instância: connected, disconnected, connecting';
COMMENT ON COLUMN public.settings.last_connection IS 'Última vez que a instância se conectou';
COMMENT ON COLUMN public.settings.is_primary IS 'Se esta é a instância principal do usuário';

-- 8. Função para garantir que apenas uma instância seja primária por usuário
CREATE OR REPLACE FUNCTION ensure_single_primary_instance()
RETURNS TRIGGER AS $$
BEGIN
    -- Se está marcando como primária, desmarcar todas as outras do mesmo usuário
    IF NEW.is_primary = true AND NEW.user_id IS NOT NULL THEN
        UPDATE public.settings 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para garantir instância primária única
DROP TRIGGER IF EXISTS trigger_ensure_single_primary ON public.settings;
CREATE TRIGGER trigger_ensure_single_primary
    BEFORE INSERT OR UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_instance();

-- 10. Migrar dados existentes (se houver configuração sem user_id)
-- Associar configurações órfãs ao primeiro usuário admin encontrado
UPDATE public.settings 
SET user_id = (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin' 
    OR email LIKE '%admin%' 
    LIMIT 1
)
WHERE user_id IS NULL 
AND EXISTS(SELECT 1 FROM auth.users LIMIT 1); 