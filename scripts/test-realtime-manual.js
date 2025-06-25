// 🧪 TESTE MANUAL DO REALTIME
// Cole este código no console do navegador (F12)

console.log('🧪 Iniciando teste manual do Realtime...');

// Teste 1: Verificar se o Supabase está disponível
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase não está disponível no window');
  console.log('💡 Certifique-se de que o sistema está rodando');
} else {
  console.log('✅ Supabase disponível');
}

// Teste 2: Criar canal de teste
const testChannel = window.supabase
  .channel('manual-test-channel')
  .on(
    'postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages' 
    },
    (payload) => {
      console.log('🎉 REALTIME FUNCIONANDO! Nova mensagem:', payload);
    }
  )
  .subscribe((status) => {
    console.log('📡 Status do canal:', status);
    if (status === 'SUBSCRIBED') {
      console.log('✅ Canal conectado com sucesso!');
      
      // Teste 3: Inserir uma mensagem de teste
      setTimeout(async () => {
        console.log('📝 Inserindo mensagem de teste...');
        
        const { data, error } = await window.supabase
          .from('messages')
          .insert({
            conversation_id: 'test-realtime-' + Date.now(),
            content: 'Teste Realtime - ' + new Date().toLocaleTimeString(),
            from_me: false,
            sent_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('❌ Erro ao inserir mensagem:', error);
        } else {
          console.log('✅ Mensagem inserida:', data);
        }
      }, 2000);
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Erro no canal Realtime');
    }
  });

// Cleanup após 10 segundos
setTimeout(() => {
  testChannel.unsubscribe();
  console.log('🔌 Teste finalizado, canal desconectado');
}, 10000);

console.log('⏳ Aguardando resultados do teste...'); 