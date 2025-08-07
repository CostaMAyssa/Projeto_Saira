import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmojiBrowser() {
  console.log('🎯 TESTE DO EMOJI PICKER NO NAVEGADOR');
  console.log('='.repeat(60));

  try {
    // 1. Verificar se o servidor está rodando
    console.log('\n🌐 1. VERIFICANDO SERVIDOR:');
    console.log('✅ Servidor deve estar rodando em: http://localhost:5173');
    console.log('✅ Abra o navegador e acesse a URL acima');

    // 2. Instruções para teste
    console.log('\n📋 2. INSTRUÇÕES PARA TESTE:');
    console.log('   1. Abra o navegador (Chrome, Firefox, Safari)');
    console.log('   2. Acesse: http://localhost:5173');
    console.log('   3. Faça login na aplicação');
    console.log('   4. Vá para uma conversa');
    console.log('   5. Procure o botão de emoji (ícone sorriso)');
    console.log('   6. Clique no botão de emoji');
    console.log('   7. Verifique se o emoji picker abre');

    // 3. O que verificar
    console.log('\n🔍 3. O QUE VERIFICAR:');
    console.log('   ✅ O botão de emoji está visível?');
    console.log('   ✅ O botão responde ao hover?');
    console.log('   ✅ O botão responde ao clique?');
    console.log('   ✅ Aparece algum log no console?');
    console.log('   ✅ O emoji picker abre?');
    console.log('   ✅ Os emojis são clicáveis?');
    console.log('   ✅ Os emojis são inseridos no input?');

    // 4. Debug no console
    console.log('\n🐛 4. DEBUG NO CONSOLE:');
    console.log('   1. Abra o console do navegador (F12)');
    console.log('   2. Vá para a aba "Console"');
    console.log('   3. Clique no botão de emoji');
    console.log('   4. Verifique se aparecem logs:');
    console.log('      - "🎯 Botão de emoji clicado!"');
    console.log('      - "🎯 Emoji clicado: [emoji]"');
    console.log('   5. Se houver erros, copie e cole aqui');

    // 5. Possíveis problemas
    console.log('\n⚠️ 5. POSSÍVEIS PROBLEMAS:');
    console.log('   ❌ Botão não aparece: CSS/display problem');
    console.log('   ❌ Botão não clica: Event handler problem');
    console.log('   ❌ Picker não abre: State management problem');
    console.log('   ❌ Picker abre mas não funciona: Library problem');
    console.log('   ❌ Emojis não inserem: Input ref problem');

    // 6. Soluções
    console.log('\n💡 6. SOLUÇÕES:');
    console.log('   🔧 Se o botão não aparece:');
    console.log('      - Verificar classe "hidden sm:flex"');
    console.log('      - Testar em tela maior');
    console.log('   🔧 Se o botão não clica:');
    console.log('      - Verificar se há outros elementos sobrepostos');
    console.log('      - Verificar se o onClick está sendo chamado');
    console.log('   🔧 Se o picker não abre:');
    console.log('      - Verificar se o estado isOpen está mudando');
    console.log('      - Verificar se há erros no console');
    console.log('   🔧 Se os emojis não inserem:');
    console.log('      - Verificar se o inputRef está correto');
    console.log('      - Verificar se a função handleEmojiClick é chamada');

    // 7. Teste manual
    console.log('\n🧪 7. TESTE MANUAL:');
    console.log('   1. Abra o console do navegador');
    console.log('   2. Cole este código no console:');
    console.log('      document.querySelector("button[class*=\'smile\']")?.click()');
    console.log('   3. Verifique se o botão é encontrado e clicado');
    console.log('   4. Se não encontrar, tente:');
    console.log('      document.querySelector("button")?.click()');

    // 8. Conversas para teste
    console.log('\n📱 8. CONVERSAS PARA TESTE:');

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
      .limit(3);

    if (convError) {
      console.log(`❌ Erro ao buscar conversas: ${convError.message}`);
    } else {
      console.log(`✅ ${conversations.length} conversas disponíveis para teste:`);
      
      conversations.forEach((conv, i) => {
        const client = conv.clients;
        console.log(`   ${i + 1}. ${client?.name || 'N/A'} (${client?.phone || 'N/A'})`);
        console.log(`      ID: ${conv.id}`);
        console.log(`      Última mensagem: ${conv.last_message_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.log(`❌ ERRO GERAL: ${error.message}`);
  }
}

testEmojiBrowser(); 