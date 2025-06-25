-- Migração: Adicionar campos de personalização visual aos formulários
-- Data: 2025-06-25
-- Descrição: Permite personalizar logo, cores e branding dos formulários

-- Adicionar campos de personalização à tabela forms
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#f9fafb',
ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#10b981', 
ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#111827';

-- Comentários para documentação
COMMENT ON COLUMN forms.logo_url IS 'URL do logo personalizado do formulário';
COMMENT ON COLUMN forms.background_color IS 'Cor de fundo do formulário (hex)';
COMMENT ON COLUMN forms.accent_color IS 'Cor de destaque para botões e links (hex)';
COMMENT ON COLUMN forms.text_color IS 'Cor do texto principal (hex)';

-- Criar índice para performance se necessário
-- CREATE INDEX IF NOT EXISTS idx_forms_branding ON forms(logo_url) WHERE logo_url IS NOT NULL; 