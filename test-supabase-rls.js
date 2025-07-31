import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔍 Testando conectividade com Supabase...\n');

  try {
    // Teste 1: Verificar se conseguimos fazer uma consulta simples
    console.log('📊 Teste 1: Consultando tabela messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);

    if (messagesError) {
      console.log('   ❌ Erro ao consultar messages:', messagesError.message);
      console.log('   📝 Código do erro:', messagesError.code);
    } else {
      console.log('   ✅ Consulta messages bem-sucedida');
    }

    // Teste 2: Verificar tabela conversations
    console.log('\n📊 Teste 2: Consultando tabela conversations...');
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (conversationsError) {
      console.log('   ❌ Erro ao consultar conversations:', conversationsError.message);
      console.log('   📝 Código do erro:', conversationsError.code);
    } else {
      console.log('   ✅ Consulta conversations bem-sucedida');
    }

    // Teste 3: Verificar tabela clients
    console.log('\n📊 Teste 3: Consultando tabela clients...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (clientsError) {
      console.log('   ❌ Erro ao consultar clients:', clientsError.message);
      console.log('   📝 Código do erro:', clientsError.code);
    } else {
      console.log('   ✅ Consulta clients bem-sucedida');
    }

    // Teste 4: Verificar autenticação
    console.log('\n🔐 Teste 4: Verificando status de autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('   ❌ Erro de autenticação:', authError.message);
    } else if (user) {
      console.log('   ✅ Usuário autenticado:', user.email);
    } else {
      console.log('   ⚠️  Nenhum usuário autenticado (usando chave anon)');
    }

    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('='.repeat(50));
    
    if (messagesError || conversationsError || clientsError) {
      console.log('❌ Alguns testes falharam - isso confirma os erros 406');
      console.log('🔧 Solução: Execute o script SQL manual no Supabase Dashboard');
      console.log('📄 Arquivo: fix-rls-policies-manual.sql');
      console.log('\n📝 Passos para corrigir:');
      console.log('1. Abra o Supabase Dashboard');
      console.log('2. Vá para SQL Editor');
      console.log('3. Execute o conteúdo do arquivo fix-rls-policies-manual.sql');
      console.log('4. Teste novamente o frontend');
    } else {
      console.log('✅ Todos os testes passaram - RLS está funcionando corretamente');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

testSupabaseConnection().catch(console.error);