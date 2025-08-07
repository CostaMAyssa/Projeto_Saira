import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLayoutFix() {
  console.log('🧪 TESTANDO CORREÇÕES DE LAYOUT');
  console.log('='.repeat(50));

  try {
    // 1. Verificar mensagens com URLs longas
    console.log('\n📋 1. VERIFICANDO MENSAGENS COM URLS LONGAS:');

    const { data: longMessages, error: longError } = await supabase
      .from('messages')
      .select('*')
      .ilike('content', '%http%')
      .order('sent_at', { ascending: false })
      .limit(5);

    if (longError) {
      console.log(`❌ Erro ao buscar mensagens longas: ${longError.message}`);
    } else {
      console.log(`✅ ${longMessages.length} mensagens com URLs encontradas:`);
      longMessages.forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.sent_at}] ${msg.content?.substring(0, 60)}...`);
        console.log(`      Tamanho: ${msg.content?.length || 0} caracteres`);
        console.log(`      Conversa: ${msg.conversation_id}`);
      });
    }

    // 2. Verificar conversas que podem ter problemas de layout
    console.log('\n📋 2. VERIFICANDO CONVERSAS COM MENSAGENS LONGAS:');

    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        client_id,
        last_message_at,
        clients (
          id,
          name,
          phone
        )
      `)
      .order('last_message_at', { ascending: false })
      .limit(10);

    if (convError) {
      console.log(`❌ Erro ao buscar conversas: ${convError.message}`);
    } else {
      console.log(`✅ ${conversations.length} conversas encontradas:`);
      conversations.forEach((conv, i) => {
        const client = conv.clients;
        console.log(`   ${i + 1}. ${client?.name || 'N/A'} (${client?.phone || 'N/A'})`);
        console.log(`      ID: ${conv.id}`);
        console.log(`      Última mensagem: ${conv.last_message_at}`);
      });
    }

    // 3. Verificar mensagens da conversa da Mayssa (que tem URLs longas)
    console.log('\n📋 3. VERIFICANDO MENSAGENS DA MAYSSA:');

    const { data: mayssaClient, error: mayssaError } = await supabase
      .from('clients')
      .select('id, name, phone')
      .ilike('name', '%mayssa%')
      .ilike('phone', '%556492019427%')
      .single();

    if (mayssaError) {
      console.log(`❌ Erro ao buscar Mayssa: ${mayssaError.message}`);
    } else if (mayssaClient) {
      console.log(`✅ Mayssa encontrada: ${mayssaClient.name} (${mayssaClient.phone})`);

      // Buscar conversa da Mayssa
      const { data: mayssaConversation, error: mayssaConvError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', mayssaClient.id)
        .single();

      if (mayssaConvError) {
        console.log(`❌ Erro ao buscar conversa da Mayssa: ${mayssaConvError.message}`);
      } else if (mayssaConversation) {
        // Buscar mensagens da conversa da Mayssa
        const { data: mayssaMessages, error: mayssaMsgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', mayssaConversation.id)
          .order('sent_at', { ascending: true });

        if (mayssaMsgError) {
          console.log(`❌ Erro ao buscar mensagens da Mayssa: ${mayssaMsgError.message}`);
        } else {
          console.log(`✅ ${mayssaMessages.length} mensagens da Mayssa:`);
          
          const longMessages = mayssaMessages.filter(msg => 
            msg.content && msg.content.length > 100
          );
          
          console.log(`   📏 Mensagens longas (>100 chars): ${longMessages.length}`);
          
          longMessages.forEach((msg, i) => {
            console.log(`   ${i + 1}. [${msg.sent_at}] ${msg.content?.substring(0, 50)}...`);
            console.log(`      Tamanho: ${msg.content?.length || 0} caracteres`);
            console.log(`      Tipo: ${msg.message_type || 'text'}`);
          });
        }
      }
    }

    // 4. Resumo das correções aplicadas
    console.log('\n🎯 RESUMO DAS CORREÇÕES APLICADAS:');
    console.log('='.repeat(50));
    console.log('✅ LAYOUT CORRIGIDO:');
    console.log('   1. Larguras das mensagens reduzidas: max-w-[75%] md:max-w-[60%] lg:max-w-[55%]');
    console.log('   2. Quebra de palavras melhorada: break-all em vez de break-words');
    console.log('   3. Layout de colunas fixo: w-80 para laterais, flex-1 para centro');
    console.log('   4. Bordas adicionadas para separação visual');
    console.log('   5. Larguras mínimas e máximas definidas');

    console.log('\n💡 TESTE MANUAL:');
    console.log('   1. Acesse a conversa da Mayssa (556492019427)');
    console.log('   2. Verifique se a área de detalhes permanece visível');
    console.log('   3. Teste com mensagens longas (URLs)');
    console.log('   4. Verifique se o layout não quebra');

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('   1. Fazer build da aplicação');
    console.log('   2. Testar no navegador');
    console.log('   3. Verificar responsividade');
    console.log('   4. Testar com diferentes tamanhos de tela');

  } catch (error) {
    console.log(`❌ ERRO GERAL: ${error.message}`);
  }
}

testLayoutFix(); 