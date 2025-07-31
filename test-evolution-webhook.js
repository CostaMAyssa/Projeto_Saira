const testEvolutionWebhook = async () => {
  console.log('🧪 Simulando webhook da Evolution API...');
  
  try {
    // Simular exatamente o formato que a Evolution API envia
    const evolutionPayload = {
      instance: 'chat saira',
      data: {
        key: {
          remoteJid: '5564920194270@s.whatsapp.net',
          fromMe: false,
          id: 'evolution_test_' + Date.now()
        },
        pushName: 'Mayssa',
        message: {
          conversation: 'oii - teste às ' + new Date().toLocaleTimeString()
        },
        messageTimestamp: Math.floor(Date.now() / 1000)
      }
    };

    console.log('📤 Enviando payload da Evolution API:', JSON.stringify(evolutionPayload, null, 2));

    const response = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      },
      body: JSON.stringify(evolutionPayload)
    });

    console.log('📡 Status da resposta:', response.status);
    const responseText = await response.text();
    console.log('📡 Resposta do webhook:', responseText);
    
    if (response.ok) {
      console.log('✅ Webhook processou com sucesso!');
      console.log('🔍 Agora verifique se a mensagem apareceu no chat frontend');
    } else {
      console.log('❌ Webhook retornou erro:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
};

// Também vamos testar com uma imagem
const testEvolutionImageWebhook = async () => {
  console.log('🧪 Simulando webhook de imagem da Evolution API...');
  
  try {
    const imagePayload = {
      instance: 'chat saira',
      data: {
        key: {
          remoteJid: '5564920194270@s.whatsapp.net',
          fromMe: false,
          id: 'evolution_image_' + Date.now()
        },
        pushName: 'Mayssa',
        message: {
          imageMessage: {
            caption: 'Imagem de teste às ' + new Date().toLocaleTimeString(),
            mimetype: 'image/jpeg',
            url: 'https://picsum.photos/400/300'
          }
        },
        messageTimestamp: Math.floor(Date.now() / 1000)
      }
    };

    console.log('📤 Enviando payload de imagem:', JSON.stringify(imagePayload, null, 2));

    const response = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      },
      body: JSON.stringify(imagePayload)
    });

    console.log('📡 Status da resposta (imagem):', response.status);
    const responseText = await response.text();
    console.log('📡 Resposta do webhook (imagem):', responseText);
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook de imagem:', error);
  }
};

// Executar ambos os testes
console.log('🚀 Iniciando testes de webhook...');
testEvolutionWebhook().then(() => {
  console.log('⏳ Aguardando 2 segundos...');
  setTimeout(() => {
    testEvolutionImageWebhook();
  }, 2000);
});