const checkCorrectConversation = async () => {
  console.log('🔍 Verificando a conversa correta no frontend...');
  
  try {
    // Buscar a conversa que está aberta no frontend
    const response = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/conversations?select=*,clients(name,phone)&id=eq.b102aeff-0b3c-46c6-8bd6-e0fca1a2d89c', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      }
    });

    if (response.ok) {
      const conversations = await response.json();
      if (conversations.length > 0) {
        const conv = conversations[0];
        console.log('📋 Conversa aberta no frontend:');
        console.log(`   ID: ${conv.id}`);
        console.log(`   Cliente: ${conv.clients?.name || 'N/A'} (${conv.clients?.phone || 'N/A'})`);
        console.log(`   Status: ${conv.status}`);
        
        const phoneInFrontend = conv.clients?.phone;
        console.log(`\n📱 Número no frontend: ${phoneInFrontend}`);
        console.log(`📱 Número que recebeu as mensagens de teste: 5564920194270`);
        
        if (phoneInFrontend !== '5564920194270') {
          console.log('\n❌ CONFIRMADO: Números diferentes!');
          console.log('\n💡 SOLUÇÕES:');
          console.log(`   1. Enviar mensagens de teste para: ${phoneInFrontend}`);
          console.log('   2. Ou procurar a conversa com o número 5564920194270 no frontend');
          
          // Vamos criar um teste enviando para o número correto
          console.log('\n🧪 Vou criar um teste para o número correto...');
          
          const testPayload = {
            instance: "chat saira",
            data: {
              key: {
                remoteJid: `${phoneInFrontend}@s.whatsapp.net`,
                fromMe: false,
                id: `test_${Date.now()}`
              },
              message: {
                conversation: `Teste para número correto às ${new Date().toLocaleTimeString()}`
              },
              messageTimestamp: Math.floor(Date.now() / 1000),
              pushName: "Teste Sistema",
              status: "RECEIVED"
            }
          };
          
          const webhookResponse = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
            },
            body: JSON.stringify(testPayload)
          });
          
          if (webhookResponse.ok) {
            const result = await webhookResponse.text();
            console.log(`✅ Teste enviado para ${phoneInFrontend}: ${result}`);
            console.log('🔍 Agora verifique se a mensagem aparece no frontend!');
          } else {
            console.log(`❌ Erro ao enviar teste: ${webhookResponse.status}`);
          }
        } else {
          console.log('\n✅ Os números são iguais - o problema está em outro lugar');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

checkCorrectConversation();