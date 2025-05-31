import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Supabase (mesmas do projeto)
const supabaseUrl = 'https://supapainel.insignemarketing.com.br';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.ek3IR6aUgUyvile2qJGvt3KcAwrtoX12MXOS5NUaA_c';

// Cliente administrativo
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function applyMigration(migrationFile) {
  try {
    console.log(`\n🚀 Aplicando migração: ${migrationFile}`);
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Arquivo de migração não encontrado: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Conteúdo da migração:');
    console.log('─'.repeat(50));
    console.log(migrationSQL);
    console.log('─'.repeat(50));
    
    // Como não podemos executar SQL diretamente via cliente JavaScript,
    // vamos mostrar as instruções para execução manual
    console.log('\n📋 Execute o seguinte SQL no dashboard do Supabase:');
    console.log('🌐 Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql');
    console.log('\n' + '='.repeat(60));
    console.log(migrationSQL);
    console.log('='.repeat(60));
    console.log('\n✅ Copie e cole o SQL acima no SQL Editor do Supabase e execute.');
    
  } catch (error) {
    console.error('❌ Erro ao ler migração:', error.message);
  }
}

// Função principal
async function main() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.log('❌ Por favor, especifique o arquivo de migração.');
    console.log('📖 Uso: node scripts/apply-migration.js <nome-do-arquivo.sql>');
    console.log('📖 Exemplo: node scripts/apply-migration.js 20240320000003_enable_uuid_extension.sql');
    return;
  }
  
  console.log('🔧 Preparando migração...');
  console.log(`🌐 URL: ${supabaseUrl}`);
  
  await applyMigration(migrationFile);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { applyMigration }; 