const findTestMessages = async () => {
  console.log('🔍 Procurando mensagens de teste das 16:06...');
  
  try {
    // Buscar mensagens recentes que contenham "oii - teste"
    const response = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/messages?select=*&content=ilike.*oii - teste*&order=sent_at.desc', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      }
    });

    if (response.ok) {
      const messages = await response.json();
      console.log('🧪 Mensagens "oii - teste" encontradas:', messages.length);
      
      messages.forEach((msg, index) => {
        console.log(`\n📝 Mensagem ${index + 1}:`);
        console.log(`   ID: ${msg.id}`);
        console.log(`   Conteúdo: ${msg.content}`);
        console.log(`   Conversa ID: ${msg.conversation_id}`);
        console.log(`   Remetente: ${msg.sender}`);
        console.log(`   Enviado em: ${msg.sent_at}`);
        console.log(`   From me: ${msg.from_me}`);
        console.log(`   Instance: ${msg.instance_name}`);
        console.log(`   Push name: ${msg.push_name}`);
      });
      
      if (messages.length > 0) {
        const conversationId = messages[0].conversation_id;
        console.log(`\n🔍 Conversa onde as mensagens de teste foram salvas: ${conversationId}`);
        
        // Comparar com a conversa da Mayssa
        const mayssaConversationId = 'b102aeff-0b3c-46c6-8bd6-e0fca1a2d89c';
        const isInMayssaConversation = conversationId === mayssaConversationId;
        
        console.log(`🔍 Conversa da Mayssa no frontend: ${mayssaConversationId}`);
        console.log(`✅ Mensagens de teste estão na conversa da Mayssa? ${isInMayssaConversation ? 'SIM' : 'NÃO'}`);
        
        if (!isInMayssaConversation) {
          console.log('\n❌ PROBLEMA IDENTIFICADO:');
          console.log('   As mensagens de teste foram salvas em uma conversa diferente');
          console.log('   da que está aberta no frontend!');
          
          // Buscar informações da conversa correta
          const convResponse = await fetch(`https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/conversations?select=*,clients(name,phone)&id=eq.${conversationId}`, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
            }
          });
          
          if (convResponse.ok) {
            const convData = await convResponse.json();
            if (convData.length > 0) {
              const conv = convData[0];
              console.log('\n📋 Informações da conversa correta:');
              console.log(`   ID: ${conv.id}`);
              console.log(`   Cliente: ${conv.clients?.name || 'N/A'} (${conv.clients?.phone || 'N/A'})`);
              console.log(`   Status: ${conv.status}`);
            }
          }
          
          console.log('\n💡 SOLUÇÃO:');
          console.log('   1. Abrir a conversa correta no frontend, OU');
          console.log('   2. Enviar mensagens para o número correto da Mayssa (5564920109447)');
        } else {
          console.log('\n✅ As mensagens estão na conversa correta!');
          console.log('   O problema pode estar no realtime ou no frontend.');
        }
      }
    } else {
      console.log('❌ Erro ao buscar mensagens:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

findTestMessages();