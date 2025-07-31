const testDirectInsert = async () => {
  console.log('🧪 Testando inserção direta no banco de dados...');
  
  try {
    const response = await fetch('https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        conversation_id: '01985c9e-b2b9-7b3c-8b3c-b3c8b3c8b3c8', // ID de uma conversa existente
        content: 'Teste de mensagem direta - ' + new Date().toLocaleTimeString(),
        message_type: 'text',
        sender: 'client',
        sent_at: new Date().toISOString(),
        user_id: '01985c9e-b2b9-7b3c-8b3c-b3c8b3c8b3c8', // ID de um usuário existente
        from_me: false,
        message_id: 'test_direct_' + Date.now(),
        remote_jid: '5564920194270@s.whatsapp.net',
        instance_name: 'chat saira',
        push_name: 'Teste Direto'
      })
    });

    console.log('📡 Status da inserção:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Mensagem inserida com sucesso:', result);
    } else {
      const error = await response.text();
      console.log('❌ Erro na inserção:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao inserir mensagem:', error);
  }
};

testDirectInsert();