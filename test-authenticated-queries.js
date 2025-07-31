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

async function testAuthenticatedQueries() {
  console.log('🔐 Testando consultas com usuário autenticado...\n');

  try {
    // Primeiro, vamos tentar fazer login com um usuário de teste
    console.log('📝 Tentando fazer login...');
    
    // Você pode substituir por credenciais reais de teste
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Substitua por um email real
      password: 'password123'     // Substitua por uma senha real
    });

    if (authError) {
      console.log('   ❌ Erro no login:', authError.message);
      console.log('   📝 Testando sem autenticação...\n');
    } else {
      console.log('   ✅ Login bem-sucedido!');
      console.log('   👤 Usuário:', authData.user?.email);
    }

    // Agora testar as consultas
    console.log('📊 Testando consultas nas tabelas...\n');

    // Teste 1: Messages
    console.log('1️⃣ Testando tabela messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('id, content, sender, sent_at, conversation_id')
      .limit(5);

    if (messagesError) {
      console.log('   ❌ Erro:', messagesError.message);
      console.log('   📝 Código:', messagesError.code);
      console.log('   📝 Detalhes:', messagesError.details);
    } else {
      console.log(`   ✅ Sucesso! ${messages?.length || 0} mensagens encontradas`);
      if (messages && messages.length > 0) {
        console.log('   📄 Primeira mensagem:', {
          id: messages[0].id,
          content: messages[0].content?.substring(0, 50) + '...',
          sender: messages[0].sender,
          conversation_id: messages[0].conversation_id
        });
      }
    }

    // Teste 2: Conversations
    console.log('\n2️⃣ Testando tabela conversations...');
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, client_id, assigned_to, created_at')
      .limit(5);

    if (conversationsError) {
      console.log('   ❌ Erro:', conversationsError.message);
      console.log('   📝 Código:', conversationsError.code);
      console.log('   📝 Detalhes:', conversationsError.details);
    } else {
      console.log(`   ✅ Sucesso! ${conversations?.length || 0} conversas encontradas`);
      if (conversations && conversations.length > 0) {
        console.log('   📄 Primeira conversa:', {
          id: conversations[0].id,
          client_id: conversations[0].client_id,
          assigned_to: conversations[0].assigned_to
        });
      }
    }

    // Teste 3: Clients
    console.log('\n3️⃣ Testando tabela clients...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, phone, created_at')
      .limit(5);

    if (clientsError) {
      console.log('   ❌ Erro:', clientsError.message);
      console.log('   📝 Código:', clientsError.code);
      console.log('   📝 Detalhes:', clientsError.details);
    } else {
      console.log(`   ✅ Sucesso! ${clients?.length || 0} clientes encontrados`);
      if (clients && clients.length > 0) {
        console.log('   📄 Primeiro cliente:', {
          id: clients[0].id,
          name: clients[0].name,
          phone: clients[0].phone
        });
      }
    }

    // Teste 4: Verificar status de autenticação atual
    console.log('\n4️⃣ Verificando status de autenticação...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('   ❌ Erro ao verificar usuário:', userError.message);
    } else if (user) {
      console.log('   ✅ Usuário autenticado:', user.email);
      console.log('   📝 ID do usuário:', user.id);
      console.log('   📝 Role:', user.role);
    } else {
      console.log('   ⚠️  Nenhum usuário autenticado');
    }

    // Teste 5: Testar uma consulta específica que pode estar falhando no frontend
    console.log('\n5️⃣ Testando consulta específica de conversa...');
    const conversationId = 'b102aeff-0b3c-46c6-8bd6-e0fca1a2d89c'; // ID da conversa da Mayssa
    
    const { data: specificMessages, error: specificError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (specificError) {
      console.log('   ❌ Erro na consulta específica:', specificError.message);
      console.log('   📝 Código:', specificError.code);
    } else {
      console.log(`   ✅ Consulta específica bem-sucedida! ${specificMessages?.length || 0} mensagens`);
    }

    console.log('\n📋 RESUMO:');
    console.log('='.repeat(50));
    
    const hasErrors = messagesError || conversationsError || clientsError || specificError;
    
    if (hasErrors) {
      console.log('❌ Alguns testes falharam');
      console.log('🔧 Isso confirma que há problemas de RLS/autenticação');
      console.log('📝 Próximos passos:');
      console.log('   1. Verificar se o usuário está logado no frontend');
      console.log('   2. Aplicar as políticas RLS manualmente no Supabase');
      console.log('   3. Verificar se as sessões estão sendo mantidas corretamente');
    } else {
      console.log('✅ Todos os testes passaram!');
      console.log('🎉 O problema pode estar na configuração do frontend');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testAuthenticatedQueries().catch(console.error);