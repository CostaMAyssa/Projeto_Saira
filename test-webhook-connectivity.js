const testWebhook = async () => {
  console.log('🧪 Testando conectividade do webhook...');
  
  try {
    // Teste simples de conectividade
    const response = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      },
      body: JSON.stringify({
        instance: 'chat saira',
        key: {
          remoteJid: '5564920194270@s.whatsapp.net',
          fromMe: false,
          id: 'test_connectivity_' + Date.now()
        },
        pushName: 'Teste Conectividade',
        message: {
          conversation: 'Teste de conectividade - ' + new Date().toLocaleTimeString()
        },
        messageTimestamp: Math.floor(Date.now() / 1000)
      })
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Resposta do webhook:', responseText);
    
    if (response.ok) {
      console.log('✅ Webhook está respondendo corretamente!');
    } else {
      console.log('❌ Webhook retornou erro:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
};

testWebhook();