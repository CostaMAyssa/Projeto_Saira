const testRealtimeConnection = async () => {
  console.log('🔍 Testando conexão Realtime...');
  
  try {
    // Primeiro, vamos buscar a conversa da Mayssa para ver o ID correto
    const response = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/conversations?select=*,clients(name,phone)&clients.phone=eq.5564920109447', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      }
    });

    if (response.ok) {
      const conversations = await response.json();
      console.log('💬 Conversas da Mayssa encontradas:', conversations.length);
      
      if (conversations.length > 0) {
        const conversation = conversations[0];
        console.log(`📋 Conversa ID: ${conversation.id}`);
        console.log(`📋 Cliente: ${conversation.clients?.name} (${conversation.clients?.phone})`);
        console.log(`📋 Status: ${conversation.status}`);
        
        // Agora vamos buscar as mensagens desta conversa específica
        const messagesResponse = await fetch(`https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/messages?select=*&conversation_id=eq.${conversation.id}&order=sent_at.desc&limit=5`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
          }
        });
        
        if (messagesResponse.ok) {
          const messages = await messagesResponse.json();
          console.log(`📨 Mensagens na conversa ${conversation.id}:`, messages.length);
          
          messages.forEach((msg, index) => {
            console.log(`\n📝 Mensagem ${index + 1}:`);
            console.log(`   ID: ${msg.id}`);
            console.log(`   Conteúdo: ${msg.content}`);
            console.log(`   Remetente: ${msg.sender}`);
            console.log(`   Enviado em: ${msg.sent_at}`);
            console.log(`   From me: ${msg.from_me}`);
            console.log(`   Instance: ${msg.instance_name}`);
          });
          
          // Verificar se as mensagens de teste estão nesta conversa
          const testMessages = messages.filter(msg => 
            msg.content && (
              msg.content.includes('teste às') || 
              msg.content.includes('oii') ||
              msg.content.includes('Imagem de teste')
            )
          );
          
          console.log(`\n🧪 Mensagens de teste nesta conversa: ${testMessages.length}`);
          if (testMessages.length === 0) {
            console.log('⚠️ As mensagens de teste não estão nesta conversa!');
            console.log('⚠️ Isso pode explicar por que não aparecem no frontend.');
          } else {
            console.log('✅ Mensagens de teste encontradas nesta conversa.');
          }
        }
      } else {
        console.log('❌ Nenhuma conversa encontrada para a Mayssa');
      }
    } else {
      console.log('❌ Erro ao buscar conversas:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testRealtimeConnection();