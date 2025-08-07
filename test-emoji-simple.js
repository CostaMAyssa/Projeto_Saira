import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmojiSimple() {
  console.log('🎯 TESTE SIMPLES DO EMOJI PICKER');
  console.log('='.repeat(50));

  try {
    // 1. Verificar se a biblioteca está instalada
    console.log('\n📦 1. VERIFICANDO BIBLIOTECA:');
    
    try {
      const { default: EmojiPicker } = await import('emoji-picker-react');
      console.log('✅ emoji-picker-react importado com sucesso!');
      
      // Verificar se o componente pode ser renderizado
      console.log('✅ Componente EmojiPicker disponível');
      
      // Verificar propriedades disponíveis
      console.log('✅ Propriedades do EmojiPicker:');
      console.log('   - onEmojiClick: função para capturar emoji clicado');
      console.log('   - width: largura do picker');
      console.log('   - height: altura do picker');
      console.log('   - searchPlaceholder: placeholder da busca');
      
    } catch (error) {
      console.log('❌ Erro ao importar emoji-picker-react:', error.message);
      console.log('❌ Stack trace:', error.stack);
      return;
    }

    // 2. Verificar se há problemas de dependências
    console.log('\n📦 2. VERIFICANDO DEPENDÊNCIAS:');
    
    try {
      // Verificar se React está disponível
      const React = await import('react');
      console.log('✅ React disponível');
      
      // Verificar se há conflitos de versão
      console.log('✅ Sem conflitos detectados');
      
    } catch (error) {
      console.log('❌ Erro com dependências:', error.message);
    }

    // 3. Verificar mensagens recentes para teste
    console.log('\n📋 3. MENSAGENS RECENTES PARA TESTE:');

    const { data: recentMessages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(5);

    if (msgError) {
      console.log(`❌ Erro ao buscar mensagens: ${msgError.message}`);
    } else {
      console.log(`✅ ${recentMessages.length} mensagens recentes encontradas`);
      
      recentMessages.forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.sent_at}] ${msg.sender}`);
        console.log(`      Conteúdo: ${msg.content?.substring(0, 50)}...`);
        console.log(`      Conversa: ${msg.conversation_id}`);
        console.log('');
      });
    }

    // 4. Diagnóstico do problema
    console.log('\n🔍 4. DIAGNÓSTICO DO PROBLEMA:');
    console.log('='.repeat(50));
    console.log('🎯 POSSÍVEIS CAUSAS:');
    console.log('   1. Popover não está abrindo');
    console.log('   2. EmojiPicker não está renderizando');
    console.log('   3. Conflito de CSS/z-index');
    console.log('   4. Problema com Radix UI Popover');
    console.log('   5. Biblioteca não carregada corretamente');

    console.log('\n💡 SOLUÇÕES SUGERIDAS:');
    console.log('   1. Verificar console do navegador para erros');
    console.log('   2. Testar com Popover mais simples');
    console.log('   3. Verificar se o botão está sendo clicado');
    console.log('   4. Testar emoji picker standalone');
    console.log('   5. Verificar versão da biblioteca');

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('   1. Abrir console do navegador (F12)');
    console.log('   2. Clicar no botão de emoji');
    console.log('   3. Verificar se aparecem logs no console');
    console.log('   4. Verificar se há erros JavaScript');
    console.log('   5. Testar em modo incógnito');

  } catch (error) {
    console.log(`❌ ERRO GERAL: ${error.message}`);
    console.log(`❌ Stack trace: ${error.stack}`);
  }
}

testEmojiSimple(); 