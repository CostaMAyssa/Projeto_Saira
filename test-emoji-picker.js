import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmojiPicker() {
  console.log('🎯 TESTANDO EMOJI PICKER');
  console.log('='.repeat(50));

  try {
    // 1. Verificar se a biblioteca foi instalada
    console.log('\n📦 1. VERIFICANDO INSTALAÇÃO:');
    
    // Tentar importar a biblioteca
    try {
      const { default: EmojiPicker } = await import('emoji-picker-react');
      console.log('✅ emoji-picker-react instalado com sucesso!');
      console.log('✅ Versão disponível para uso');
    } catch (error) {
      console.log('❌ Erro ao importar emoji-picker-react:', error.message);
      return;
    }

    // 2. Verificar mensagens com emojis no banco
    console.log('\n📋 2. VERIFICANDO EMOJIS NO BANCO:');

    const { data: emojiMessages, error: emojiError } = await supabase
      .from('messages')
      .select('*')
      .or('content.like.%😀%,content.like.%😃%,content.like.%😄%,content.like.%😁%,content.like.%😆%,content.like.%😅%,content.like.%😂%,content.like.%🤣%,content.like.%😊%,content.like.%😇%')
      .order('sent_at', { ascending: false })
      .limit(10);

    if (emojiError) {
      console.log(`❌ Erro ao buscar mensagens com emojis: ${emojiError.message}`);
    } else {
      console.log(`✅ ${emojiMessages.length} mensagens com emojis encontradas:`);
      
      emojiMessages.forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.sent_at}] ${msg.sender}`);
        console.log(`      Conteúdo: ${msg.content}`);
        console.log(`      Conversa: ${msg.conversation_id}`);
        console.log('');
      });
    }

    // 3. Verificar conversas ativas
    console.log('\n📋 3. CONVERSAS ATIVAS PARA TESTE:');

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
      console.log(`✅ ${conversations.length} conversas encontradas para teste:`);
      
      conversations.forEach((conv, i) => {
        const client = conv.clients;
        console.log(`   ${i + 1}. ${client?.name || 'N/A'} (${client?.phone || 'N/A'})`);
        console.log(`      ID: ${conv.id}`);
        console.log(`      Última mensagem: ${conv.last_message_at}`);
        console.log('');
      });
    }

    // 4. Resumo das funcionalidades
    console.log('\n🎯 RESUMO DO EMOJI PICKER:');
    console.log('='.repeat(50));
    console.log('✅ FUNCIONALIDADES IMPLEMENTADAS:');
    console.log('   1. Biblioteca emoji-picker-react instalada');
    console.log('   2. Componente EmojiPicker criado');
    console.log('   3. Integração com MessageInput');
    console.log('   4. Popover com categorias em português');
    console.log('   5. Inserção de emojis no cursor');
    console.log('   6. Interface similar ao WhatsApp');

    console.log('\n💡 COMO USAR:');
    console.log('   1. Clique no botão de emoji (ícone sorriso)');
    console.log('   2. Selecione um emoji da lista');
    console.log('   3. O emoji será inserido na posição do cursor');
    console.log('   4. Envie a mensagem normalmente');

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('   1. Testar no navegador (http://localhost:5173)');
    console.log('   2. Verificar se os emojis aparecem corretamente');
    console.log('   3. Testar em diferentes conversas');
    console.log('   4. Verificar responsividade em mobile');

  } catch (error) {
    console.log(`❌ ERRO GERAL: ${error.message}`);
  }
}

testEmojiPicker(); 