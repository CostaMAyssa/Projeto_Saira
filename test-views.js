const testViews = async () => {
  console.log('🔍 Testando views de conversas...');
  
  try {
    // Testar daily_conversations_view
    console.log('\n📊 Testando daily_conversations_view...');
    const dailyResponse = await fetch(`https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/daily_conversations_view?select=*&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      }
    });

    if (dailyResponse.ok) {
      const dailyData = await dailyResponse.json();
      console.log('✅ daily_conversations_view existe e retornou:', dailyData.length, 'registros');
      if (dailyData.length > 0) {
        console.log('📋 Estrutura:', Object.keys(dailyData[0]));
        console.log('📝 Primeiro registro:', dailyData[0]);
      }
    } else {
      console.log('❌ daily_conversations_view falhou:', dailyResponse.status);
      const error = await dailyResponse.text();
      console.log('❌ Erro:', error);
    }

    // Testar monthly_conversations_view
    console.log('\n📊 Testando monthly_conversations_view...');
    const monthlyResponse = await fetch(`https://svkgfvfhmngcvfsjpero.supabase.co/rest/v1/monthly_conversations_view?select=*&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
      }
    });

    if (monthlyResponse.ok) {
      const monthlyData = await monthlyResponse.json();
      console.log('✅ monthly_conversations_view existe e retornou:', monthlyData.length, 'registros');
      if (monthlyData.length > 0) {
        console.log('📋 Estrutura:', Object.keys(monthlyData[0]));
        console.log('📝 Primeiro registro:', monthlyData[0]);
      }
    } else {
      console.log('❌ monthly_conversations_view falhou:', monthlyResponse.status);
      const error = await monthlyResponse.text();
      console.log('❌ Erro:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
};

testViews();