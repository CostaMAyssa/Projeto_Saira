-- Habilitar a extensão uuid-ossp se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se a tabela tags existe e recriar se necessário com configuração correta
DROP TABLE IF EXISTS campaign_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Recriar tabela tags com configuração correta
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('client', 'product', 'campaign')),
    color TEXT DEFAULT '#cccccc',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recriar tabela campaign_tags
CREATE TABLE campaign_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, tag_id)
);

-- Recriar índices
CREATE INDEX idx_tags_type ON tags(type);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_campaign_tags_campaign_id ON campaign_tags(campaign_id);
CREATE INDEX idx_campaign_tags_tag_id ON campaign_tags(tag_id);

-- Recriar trigger para atualizar updated_at na tabela tags
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir tags padrão
INSERT INTO tags (name, type, color) VALUES 
    ('VIP', 'campaign', '#FFD700'),
    ('Promoção', 'campaign', '#FF6B6B'),
    ('Fidelidade', 'campaign', '#4ECDC4'),
    ('Aniversário', 'campaign', '#45B7D1'),
    ('Recompra', 'campaign', '#96CEB4'),
    ('Sazonal', 'campaign', '#FECA57'),
    ('Nova', 'campaign', '#FF9FF3'),
    ('Urgente', 'campaign', '#FF5722')
ON CONFLICT (name) DO NOTHING; 