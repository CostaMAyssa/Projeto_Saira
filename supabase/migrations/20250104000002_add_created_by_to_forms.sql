-- Adicionar campo created_by à tabela forms para multi-tenancy

-- 1. Verificar se a tabela forms existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forms') THEN
        RAISE NOTICE 'Tabela forms não existe ainda - será criada quando necessário';
    END IF;
END $$;

-- 2. Se a tabela forms existir, adicionar created_by se não existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forms') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'forms' AND column_name = 'created_by'
        ) THEN
            -- Adicionar campo created_by
            ALTER TABLE forms ADD COLUMN created_by UUID REFERENCES auth.users(id);
            RAISE NOTICE 'Campo created_by adicionado à tabela forms';
        END IF;
        
        -- Criar índice para performance
        CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
    END IF;
END $$;

-- 3. Comentário explicativo
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forms') THEN
        COMMENT ON COLUMN forms.created_by IS 'ID do usuário que criou o formulário - necessário para multi-tenancy';
    END IF;
END $$; 