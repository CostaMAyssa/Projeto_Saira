-- 🔧 ADICIONAR COLUNAS FALTANTES NAS TABELAS EXISTENTES
-- Execute este arquivo no SQL Editor do Supabase Dashboard

-- 1. Adicionar colunas faltantes na tabela PRODUCTS
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Adicionar colunas faltantes na tabela FORMS  
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Adicionar colunas faltantes na tabela CLIENTS (se necessário)
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Adicionar colunas faltantes na tabela CAMPAIGNS (se necessário)
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON public.forms(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);

-- 6. Atualizar políticas RLS para as tabelas (se necessário)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos" ON public.products;
CREATE POLICY "Usuários podem ver seus próprios produtos" ON public.products
    FOR ALL USING (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Usuários podem ver seus próprios formulários" ON public.forms;
CREATE POLICY "Usuários podem ver seus próprios formulários" ON public.forms
    FOR ALL USING (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Usuários podem ver seus próprios clientes" ON public.clients;
CREATE POLICY "Usuários podem ver seus próprios clientes" ON public.clients
    FOR ALL USING (auth.uid() = created_by OR created_by IS NULL);

DROP POLICY IF EXISTS "Usuários podem ver suas próprias campanhas" ON public.campaigns;
CREATE POLICY "Usuários podem ver suas próprias campanhas" ON public.campaigns
    FOR ALL USING (auth.uid() = created_by OR created_by IS NULL);

-- 7. Verificar se as colunas foram adicionadas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('products', 'forms', 'clients', 'campaigns')
    AND column_name IN ('created_by', 'created_at', 'updated_at')
ORDER BY table_name, column_name;

-- 8. Testar as tabelas após adicionar colunas
SELECT 'products' as tabela, COUNT(*) as registros FROM public.products
UNION ALL
SELECT 'forms' as tabela, COUNT(*) as registros FROM public.forms
UNION ALL  
SELECT 'clients' as tabela, COUNT(*) as registros FROM public.clients
UNION ALL
SELECT 'campaigns' as tabela, COUNT(*) as registros FROM public.campaigns; 