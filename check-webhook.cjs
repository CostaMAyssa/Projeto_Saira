const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://svkgfvfhmngcvfsjpero.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc'
);

async function checkWebhookConfig() {
  console.log('🔗 Verificando configuração do webhook...');
  
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('evolution_instance_name', 'chat saira')
    .single();
    
  if (!settings) {
    console.log('❌ Configuração não encontrada para "chat saira"');
    return;
  }
  
  console.log('⚙️ Configuração encontrada:');
  console.log('API URL:', settings.api_url);
  console.log('Instância:', settings.evolution_instance_name);
  
  try {
    // Verificar webhook configurado na Evolution API
    console.log('\n🔗 Verificando webhook na Evolution API...');
    const response = await fetch(`${settings.api_url}/webhook/find/chat%20saira`, {
      headers: {
        'apikey': settings.api_key
      }
    });
    
    if (response.ok) {
      const webhookData = await response.json();
      console.log('✅ Webhook configurado:', JSON.stringify(webhookData, null, 2));
    } else {
      console.log('❌ Erro ao buscar webhook:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Resposta:', errorText);
    }
    
    // Verificar status da instância
    console.log('\n📱 Verificando status da instância...');
    const statusResponse = await fetch(`${settings.api_url}/instance/connect/chat%20saira`, {
      headers: {
        'apikey': settings.api_key
      }
    });
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('📱 Status da instância:', JSON.stringify(statusData, null, 2));
    } else {
      console.log('❌ Erro ao verificar status:', statusResponse.status, statusResponse.statusText);
    }
    
  } catch (error) {
    console.log('❌ Erro na verificação:', error.message);
  }
}

checkWebhookConfig();