-- 🔔 SCRIPT PARA HABILITAR REALTIME
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar/atualizar a publication supabase_realtime
BEGIN;

-- Remove a publication existente se houver
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Cria nova publication sem tabelas
CREATE PUBLICATION supabase_realtime;

COMMIT;

-- 2. Adicionar tabelas específicas à publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 3. Verificar se as tabelas foram adicionadas
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 4. Configurar RLS para realtime (corrigido)
-- Primeiro dropar a policy se existir, depois criar
DROP POLICY IF EXISTS "Authenticated users can receive message broadcasts" ON "realtime"."messages";

CREATE POLICY "Authenticated users can receive message broadcasts"
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (true);

-- 5. Verificar status da replicação
SELECT 
    slot_name,
    plugin,
    slot_type,
    datoid,
    active
FROM pg_replication_slots 
WHERE slot_name LIKE '%realtime%';

-- ✅ SUCESSO: Realtime habilitado para conversations e messages 