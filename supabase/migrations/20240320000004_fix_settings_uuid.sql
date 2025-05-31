-- Corrigir a tabela settings para usar UUID corretamente
-- Primeiro, verificar se a extensão UUID está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dropar a tabela settings existente e recriar corretamente
DROP TABLE IF EXISTS settings CASCADE;

-- Recriar a tabela settings com estrutura correta
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evolution_api_url TEXT,
    evolution_api_key TEXT,
    instance_name TEXT,
    global_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir configuração padrão do WhatsApp com UUID automático
INSERT INTO settings (evolution_api_url, evolution_api_key, instance_name, global_mode)
VALUES ('', '', '', false); 