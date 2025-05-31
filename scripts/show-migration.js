import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.log('❌ Por favor, especifique o arquivo de migração.');
  console.log('📖 Uso: node scripts/show-migration.js <nome-do-arquivo.sql>');
  process.exit(1);
}

try {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
  
  if (!fs.existsSync(migrationPath)) {
    console.log(`❌ Arquivo não encontrado: ${migrationPath}`);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log(`\n🚀 Migração: ${migrationFile}`);
  console.log('📋 Execute o seguinte SQL no dashboard do Supabase:');
  console.log('🌐 Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql');
  console.log('\n' + '='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));
  console.log('\n✅ Copie e cole o SQL acima no SQL Editor do Supabase e execute.');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
} 