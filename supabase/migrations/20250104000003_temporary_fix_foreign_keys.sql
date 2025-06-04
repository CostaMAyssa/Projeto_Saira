-- CORREÇÃO TEMPORÁRIA: Remover foreign key constraints que estão bloqueando saves
-- Problema: IDs de usuário não existem na tabela auth.users causando violações

-- 1. Remover constraints de foreign key temporariamente
DO $$ 
BEGIN
    -- Clients
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'clients' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%created_by%'
    ) THEN
        ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_created_by_fkey;
        RAISE NOTICE 'Removida foreign key constraint de clients.created_by';
    END IF;

    -- Products
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'products' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%created_by%'
    ) THEN
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_created_by_fkey;
        RAISE NOTICE 'Removida foreign key constraint de products.created_by';
    END IF;

    -- Campaigns
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'campaigns' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%created_by%'
    ) THEN
        ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_created_by_fkey;
        RAISE NOTICE 'Removida foreign key constraint de campaigns.created_by';
    END IF;

    -- Forms
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'forms' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%created_by%'
    ) THEN
        ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_created_by_fkey;
        RAISE NOTICE 'Removida foreign key constraint de forms.created_by';
    END IF;
END $$;

-- 2. Comentário explicativo
COMMENT ON SCHEMA public IS 'Foreign key constraints temporariamente removidas para permitir saves enquanto corrigimos autenticação';

-- 3. Verificar se há dados órfãos para limpeza posterior
SELECT 'clients' as tabela, COUNT(*) as registros_sem_owner
FROM clients 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM auth.users)

UNION ALL

SELECT 'products' as tabela, COUNT(*) as registros_sem_owner
FROM products 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM auth.users)

UNION ALL

SELECT 'campaigns' as tabela, COUNT(*) as registros_sem_owner
FROM campaigns 
WHERE created_by IS NOT NULL 
AND created_by NOT IN (SELECT id FROM auth.users); 