-- Adicionar campo created_by à tabela products para multi-tenancy

-- 1. Verificar se a tabela products existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        RAISE EXCEPTION 'Tabela products não existe. Crie a tabela antes de executar esta migração.';
    END IF;
END $$;

-- 2. Adicionar campo created_by se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'created_by'
    ) THEN
        -- Adicionar campo created_by
        ALTER TABLE products ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Campo created_by adicionado à tabela products';
    END IF;
END $$;

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);

-- 4. Se houver produtos existentes sem created_by, você precisará atribuí-los a um usuário
-- Esta parte pode ser executada manualmente depois se necessário
COMMENT ON COLUMN products.created_by IS 'ID do usuário que criou o produto - necessário para multi-tenancy'; 