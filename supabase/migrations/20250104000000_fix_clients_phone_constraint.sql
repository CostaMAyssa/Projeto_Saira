-- Corrigir constraint de telefone na tabela clients para permitir multi-tenancy
-- Problema: constraint UNIQUE(phone) global impede que usuários diferentes tenham clientes com mesmo telefone
-- Solução: constraint UNIQUE(phone, created_by) permite mesmo telefone para usuários diferentes

-- 1. Remover constraint antiga de telefone único global (se existir)
DO $$ 
BEGIN
    -- Verificar se existe constraint de telefone único
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'clients' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%phone%'
    ) THEN
        -- Encontrar o nome exato da constraint
        DECLARE
            constraint_name_var TEXT;
        BEGIN
            SELECT constraint_name INTO constraint_name_var
            FROM information_schema.table_constraints 
            WHERE table_name = 'clients' 
            AND constraint_type = 'UNIQUE' 
            AND constraint_name LIKE '%phone%'
            LIMIT 1;
            
            -- Remover a constraint antiga
            EXECUTE 'ALTER TABLE clients DROP CONSTRAINT ' || constraint_name_var;
            RAISE NOTICE 'Removida constraint antiga: %', constraint_name_var;
        END;
    END IF;
END $$;

-- 2. Adicionar nova constraint que permite mesmo telefone para usuários diferentes
ALTER TABLE clients 
ADD CONSTRAINT clients_phone_user_unique 
UNIQUE (phone, created_by);

-- 3. Comentário explicativo
COMMENT ON CONSTRAINT clients_phone_user_unique ON clients IS 
'Permite que usuários diferentes tenham clientes com mesmo telefone, mas impede duplicatas dentro do mesmo usuário';

-- 4. Verificar se a tabela tem o campo created_by (necessário para multi-tenancy)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'created_by'
    ) THEN
        -- Adicionar campo created_by se não existir
        ALTER TABLE clients ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Campo created_by adicionado à tabela clients';
    END IF;
END $$;

-- 5. Criar índice para performance em consultas filtradas por usuário
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_phone_user ON clients(phone, created_by); 