// 🔔 SCRIPT PARA TESTAR REALTIME NO FRONTEND
// Execute este script no console do navegador (F12)

console.log('🧪 TESTE DE REALTIME INICIADO...');

// 1. Verificar se o Supabase está disponível
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase não está disponível no window');
  console.log('💡 Certifique-se de que o sistema está rodando em http://localhost:8080');
} else {
  console.log('✅ Supabase disponível');
}

// 2. Criar canal de teste para mensagens
const testChannel = window.supabase
  .channel('test-messages-realtime')
  .on(
    'postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `conversation_id=eq.70ccc69c-a83e-4004-b089-a177d38de321`
    },
    (payload) => {
      console.log('🎉 REALTIME FUNCIONANDO! Nova mensagem:', payload);
      console.log('📨 Conteúdo:', payload.new.content);
      console.log('👤 Remetente:', payload.new.sender);
      console.log('⏰ Timestamp:', payload.new.sent_at);
    }
  )
  .on(
    'postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'messages',
      filter: `conversation_id=eq.70ccc69c-a83e-4004-b089-a177d38de321`
    },
    (payload) => {
      console.log('🔄 Mensagem atualizada via Realtime:', payload);
    }
  )
  .subscribe((status) => {
    console.log('📡 Status do canal Realtime:', status);
    if (status === 'SUBSCRIBED') {
      console.log('✅ Canal conectado com sucesso!');
      console.log('🎯 Aguardando mensagens na conversa: 70ccc69c-a83e-4004-b089-a177d38de321');
      
      // 3. Inserir uma mensagem de teste após 2 segundos
      setTimeout(async () => {
        console.log('📝 Inserindo mensagem de teste...');
        
        const { data, error } = await window.supabase
          .from('messages')
          .insert({
            conversation_id: '70ccc69c-a83e-4004-b089-a177d38de321',
            content: 'Teste Realtime Frontend - ' + new Date().toLocaleTimeString(),
            sender: 'client',
            sent_at: new Date().toISOString(),
            message_type: 'text'
          });
          
        if (error) {
          console.error('❌ Erro ao inserir mensagem:', error);
        } else {
          console.log('✅ Mensagem inserida:', data);
          console.log('🔔 Se o Realtime estiver funcionando, você verá a mensagem acima!');
        }
      }, 2000);
      
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Erro no canal Realtime');
      console.log('💡 Verifique se o Supabase Realtime está configurado corretamente');
    } else if (status === 'TIMED_OUT') {
      console.error('❌ Timeout na conexão Realtime');
    }
  });

// 4. Testar webhook também
console.log('🌐 Testando webhook...');
fetch('https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event: 'messages.upsert',
    instance: 'caldasIA',
    data: {
      key: {
        remoteJid: '556481365341@s.whatsapp.net',
        fromMe: false,
        id: 'TEST_FRONTEND_' + Date.now()
      },
      pushName: 'Teste Frontend',
      status: 'DELIVERY_ACK',
      message: {
        conversation: 'Teste via Frontend - ' + new Date().toLocaleTimeString()
      },
      messageType: 'conversation',
      messageTimestamp: Math.floor(Date.now() / 1000),
      instanceId: 'f86c8b02-29df-4de1-ac9d-1e8c78d7475c',
      source: 'android'
    }
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Webhook funcionando:', data);
  console.log('🔔 Aguarde 2 segundos para ver se a mensagem aparece via Realtime...');
})
.catch(error => {
  console.error('❌ Erro no webhook:', error);
});

// 5. Cleanup após 30 segundos
setTimeout(() => {
  testChannel.unsubscribe();
  console.log('🔌 Teste finalizado, canal desconectado');
  console.log('📊 RESULTADO:');
  console.log('   - Se você viu "REALTIME FUNCIONANDO!" acima, está tudo OK!');
  console.log('   - Se não viu, o problema é no Supabase Realtime');
}, 30000);

console.log('⏳ Teste rodando por 30 segundos...'); 