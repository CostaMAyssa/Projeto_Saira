-- Criação da tabela tags se não existir
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('client', 'product', 'campaign')),
    color TEXT DEFAULT '#cccccc',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de relacionamento campaign_tags
CREATE TABLE IF NOT EXISTS campaign_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, tag_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_campaign_tags_campaign_id ON campaign_tags(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_tags_tag_id ON campaign_tags(tag_id);

-- Trigger para atualizar updated_at na tabela tags
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas tags padrão para campanhas se não existirem
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