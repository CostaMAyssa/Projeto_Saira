const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://svkgfvfhmngcvfsjpero.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
);

async function reconnectInstance() {
  console.log('🔄 Tentando reconectar instância "chat saira"...');
  
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('evolution_instance_name', 'chat saira')
    .single();
    
  if (!settings) {
    console.log('❌ Configuração não encontrada');
    return;
  }
  
  console.log('⚙️ Usando configuração:');
  console.log('API URL:', settings.api_url);
  console.log('Instância:', settings.evolution_instance_name);
  
  try {
    // Primeiro, vamos verificar o status atual
    console.log('\n📱 Verificando status atual...');
    const statusResponse = await fetch(`${settings.api_url}/instance/fetchInstances`, {
      headers: {
        'apikey': settings.api_key
      }
    });
    
    if (statusResponse.ok) {
      const instances = await statusResponse.json();
      const chatSaira = instances.find(i => i.name === 'chat saira');
      if (chatSaira) {
        console.log('Status atual:', chatSaira.connectionStatus);
        console.log('Número:', chatSaira.number);
        console.log('Última atualização:', new Date(chatSaira.updatedAt).toLocaleString('pt-BR'));
      }
    }
    
    // Tentar reconectar
    console.log('\n🔄 Tentando reconectar...');
    const reconnectResponse = await fetch(`${settings.api_url}/instance/restart/chat%20saira`, {
      method: 'PUT',
      headers: {
        'apikey': settings.api_key,
        'Content-Type': 'application/json'
      }
    });
    
    if (reconnectResponse.ok) {
      const result = await reconnectResponse.json();
      console.log('✅ Comando de reconexão enviado:', result);
      
      // Aguardar um pouco e verificar novamente
      console.log('\n⏳ Aguardando 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const newStatusResponse = await fetch(`${settings.api_url}/instance/fetchInstances`, {
        headers: {
          'apikey': settings.api_key
        }
      });
      
      if (newStatusResponse.ok) {
        const newInstances = await newStatusResponse.json();
        const newChatSaira = newInstances.find(i => i.name === 'chat saira');
        if (newChatSaira) {
          console.log('✅ Novo status:', newChatSaira.connectionStatus);
          if (newChatSaira.connectionStatus === 'open') {
            console.log('🎉 Instância conectada com sucesso!');
          } else {
            console.log('⚠️ Instância ainda não conectada. Status:', newChatSaira.connectionStatus);
          }
        }
      }
    } else {
      console.log('❌ Erro ao reconectar:', reconnectResponse.status, reconnectResponse.statusText);
      const errorText = await reconnectResponse.text();
      console.log('Resposta:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

reconnectInstance();