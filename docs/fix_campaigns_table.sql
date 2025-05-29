-- Configuração da tabela campaigns no Supabase
-- Execute este script no SQL Editor do Supabase

-- Garantir que a extensão uuid-ossp está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar a tabela campaigns com auto-geração de UUID no campo id
ALTER TABLE campaigns 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verificar se a configuração foi aplicada
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'campaigns' AND column_name = 'id';

-- Testar inserção (opcional - pode comentar estas linhas após o teste)
INSERT INTO campaigns (name, trigger, status, template, target_audience, created_by)
VALUES ('Teste', 'manual', 'ativa', 'Template teste', '{}', '58ce41aa-d63d-4655-b1a1-9ee705e05c3a');

-- Ver o resultado do teste
SELECT id, name, trigger, status FROM campaigns WHERE name = 'Teste'; 