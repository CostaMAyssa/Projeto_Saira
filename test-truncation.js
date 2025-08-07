import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTruncation() {
  console.log('🧪 TESTANDO FUNCIONALIDADE DE TRUNCAMENTO - LIMITES AUMENTADOS');
  console.log('='.repeat(60));

  try {
    // 1. Verificar mensagens que precisam de truncamento
    console.log('\n📋 1. VERIFICANDO MENSAGENS LONGAS:');

    const { data: longMessages, error: longError } = await supabase
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20);

    if (longError) {
      console.log(`❌ Erro ao buscar mensagens: ${longError.message}`);
      return;
    }

    console.log(`✅ ${longMessages.length} mensagens encontradas:`);
    
    const messagesToTruncate = longMessages.filter(msg => 
      msg.content && msg.content.length > 300 // Aumentado de 150 para 300
    );
    
    console.log(`📏 Mensagens que precisam de truncamento (>300 chars): ${messagesToTruncate.length}`);
    
    messagesToTruncate.forEach((msg, i) => {
      const isUrl = msg.content?.includes('http');
      const truncated = msg.content?.substring(0, 300) + '...'; // Aumentado de 150 para 300
      const fullLength = msg.content?.length || 0;
      
      console.log(`   ${i + 1}. [${msg.sent_at}] ${msg.sender}`);
      console.log(`      Tamanho: ${fullLength} caracteres`);
      console.log(`      É URL: ${isUrl ? 'SIM' : 'NÃO'}`);
      console.log(`      Truncado: ${truncated}`);
      console.log(`      Conversa: ${msg.conversation_id}`);
      console.log('');
    });

    // 2. Verificar URLs específicas
    console.log('\n📋 2. VERIFICANDO URLS LONGAS:');

    const { data: urlMessages, error: urlError } = await supabase
      .from('messages')
      .select('*')
      .ilike('content', '%http%')
      .order('sent_at', { ascending: false })
      .limit(10);

    if (urlError) {
      console.log(`❌ Erro ao buscar URLs: ${urlError.message}`);
    } else {
      console.log(`✅ ${urlMessages.length} mensagens com URLs encontradas:`);
      
      urlMessages.forEach((msg, i) => {
        const urlLength = msg.content?.length || 0;
        const shouldTruncate = urlLength > 150; // Aumentado de 100 para 150
        const truncated = shouldTruncate ? msg.content?.substring(0, 150) + '...' : msg.content; // Aumentado de 80 para 150
        
        console.log(`   ${i + 1}. [${msg.sent_at}] ${msg.sender}`);
        console.log(`      Tamanho da URL: ${urlLength} caracteres`);
        console.log(`      Precisa truncar: ${shouldTruncate ? 'SIM' : 'NÃO'}`);
        console.log(`      Truncado: ${truncated}`);
        console.log('');
      });
    }

    // 3. Verificar conversas com problemas de layout
    console.log('\n📋 3. CONVERSAS COM PROBLEMAS DE LAYOUT:');

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
      .limit(5);

    if (convError) {
      console.log(`❌ Erro ao buscar conversas: ${convError.message}`);
    } else {
      console.log(`✅ ${conversations.length} conversas encontradas:`);
      
      for (const conv of conversations) {
        const client = conv.clients;
        console.log(`   📱 ${client?.name || 'N/A'} (${client?.phone || 'N/A'})`);
        console.log(`      ID: ${conv.id}`);
        
        // Buscar mensagens longas desta conversa
        const { data: convMessages, error: convMsgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('sent_at', { ascending: false })
          .limit(5);

        if (!convMsgError && convMessages) {
          const longMessagesInConv = convMessages.filter(msg => 
            msg.content && msg.content.length > 300 // Aumentado de 150 para 300
          );
          
          console.log(`      Mensagens longas: ${longMessagesInConv.length}`);
          
          if (longMessagesInConv.length > 0) {
            console.log(`      ⚠️ ESTA CONVERSA PRECISA DE TRUNCAMENTO!`);
          }
        }
        console.log('');
      }
    }

    // 4. Resumo das melhorias atualizadas
    console.log('\n🎯 RESUMO DAS MELHORIAS ATUALIZADAS:');
    console.log('='.repeat(60));
    console.log('✅ TRUNCAMENTO MELHORADO:');
    console.log('   1. Limite de 300 caracteres para texto normal (dobrado!)');
    console.log('   2. Limite de 150 caracteres para URLs longas (quase dobrado!)');
    console.log('   3. Botão "Ler mais" / "Mostrar menos"');
    console.log('   4. Detecção automática de URLs');
    console.log('   5. Estado local para expandir/recolher');

    console.log('\n💡 COMPORTAMENTO ESPERADO:');
    console.log('   1. Mensagens mostram muito mais conteúdo antes de truncar');
    console.log('   2. URLs longas mostram 150 caracteres antes de truncar');
    console.log('   3. Botão "Ler mais" aparece menos frequentemente');
    console.log('   4. Layout permanece estável');
    console.log('   5. Experiência mais similar ao WhatsApp');

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('   1. Fazer build da aplicação');
    console.log('   2. Testar no navegador');
    console.log('   3. Verificar se mostra mais conteúdo');
    console.log('   4. Ajustar se ainda precisar de mais caracteres');

  } catch (error) {
    console.log(`❌ ERRO GERAL: ${error.message}`);
  }
}

testTruncation(); 