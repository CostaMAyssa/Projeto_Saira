import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvolutionApiConfig() {
  console.log('🔍 VERIFICANDO CONFIGURAÇÃO DA EVOLUTION API');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar configurações no banco
    console.log('\n📋 1. CONFIGURAÇÕES NO BANCO:');
    
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('evolution_instance_name', 'chat saira')
      .single();
    
    if (settingsError) {
      console.log(`❌ Erro ao buscar configuração: ${settingsError.message}`);
      return;
    }
    
    console.log(`✅ Configuração encontrada:`);
    console.log(`   User ID: ${settings.user_id}`);
    console.log(`   Instance: ${settings.evolution_instance_name}`);
    console.log(`   API URL: ${settings.api_url}`);
    console.log(`   API Key: ${settings.api_key ? 'CONFIGURADO' : 'NULL'}`);
    console.log(`   Status: ${settings.instance_status}`);
    
    // 2. Verificar status da instância na Evolution API
    console.log('\n📋 2. VERIFICANDO STATUS DA INSTÂNCIA:');
    
    try {
      const response = await fetch(`${settings.api_url}/instance/fetchInstances`, {
        method: 'GET',
        headers: {
          'apikey': settings.api_key
        }
      });
      
      if (response.ok) {
        const instances = await response.json();
        console.log(`✅ Instâncias encontradas:`);
        instances.forEach((instance, i) => {
          console.log(`   ${i + 1}. ${instance.instance.instanceName}`);
          console.log(`      Status: ${instance.instance.status}`);
          console.log(`      Webhook: ${instance.instance.webhook?.enabled ? 'ENABLED' : 'DISABLED'}`);
          if (instance.instance.webhook?.enabled) {
            console.log(`      URL: ${instance.instance.webhook?.url || 'NULL'}`);
            console.log(`      Events: ${instance.instance.webhook?.events?.join(', ') || 'NULL'}`);
          }
        });
      } else {
        console.log(`❌ Erro ao verificar instâncias: ${response.status}`);
        const errorText = await response.text();
        console.log(`   Erro: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar instâncias: ${error.message}`);
    }
    
    // 3. Verificar configuração do webhook
    console.log('\n📋 3. VERIFICANDO CONFIGURAÇÃO DO WEBHOOK:');
    
    try {
      const webhookResponse = await fetch(`${settings.api_url}/webhook/find/${settings.evolution_instance_name}`, {
        method: 'GET',
        headers: {
          'apikey': settings.api_key
        }
      });
      
      if (webhookResponse.ok) {
        const webhookConfig = await webhookResponse.json();
        console.log(`✅ Configuração do webhook:`);
        console.log(`   Enabled: ${webhookConfig.enabled}`);
        console.log(`   URL: ${webhookConfig.url}`);
        console.log(`   Events: ${webhookConfig.events?.join(', ') || 'NULL'}`);
        console.log(`   By Events: ${webhookConfig.webhookByEvents}`);
      } else {
        console.log(`❌ Erro ao verificar webhook: ${webhookResponse.status}`);
        const errorText = await webhookResponse.text();
        console.log(`   Erro: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar webhook: ${error.message}`);
    }
    
    // 4. Reconfigurar webhook se necessário
    console.log('\n📋 4. RECONFIGURANDO WEBHOOK:');
    
    const webhookUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver';
    
    try {
      const webhookConfig = {
        webhook: {
          enabled: true,
          url: webhookUrl,
          byEvents: true,
          events: ["MESSAGES_UPSERT"]
        }
      };
      
      const setWebhookResponse = await fetch(`${settings.api_url}/webhook/set/${settings.evolution_instance_name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': settings.api_key
        },
        body: JSON.stringify(webhookConfig)
      });
      
      if (setWebhookResponse.ok) {
        const result = await setWebhookResponse.json();
        console.log(`✅ Webhook reconfigurado com sucesso!`);
        console.log(`   Resultado: ${JSON.stringify(result)}`);
      } else {
        console.log(`❌ Erro ao reconfigurar webhook: ${setWebhookResponse.status}`);
        const errorText = await setWebhookResponse.text();
        console.log(`   Erro: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao reconfigurar webhook: ${error.message}`);
    }
    
    // 5. Verificar se a instância está conectada
    console.log('\n📋 5. VERIFICANDO CONEXÃO DA INSTÂNCIA:');
    
    try {
      const connectionResponse = await fetch(`${settings.api_url}/instance/connectionState/${settings.evolution_instance_name}`, {
        method: 'GET',
        headers: {
          'apikey': settings.api_key
        }
      });
      
      if (connectionResponse.ok) {
        const connectionState = await connectionResponse.json();
        console.log(`✅ Estado da conexão:`);
        console.log(`   Status: ${connectionState.state}`);
        console.log(`   Instance: ${connectionState.instance}`);
        console.log(`   Connected: ${connectionState.state === 'open' ? 'SIM' : 'NÃO'}`);
      } else {
        console.log(`❌ Erro ao verificar conexão: ${connectionResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar conexão: ${error.message}`);
    }
    
    // 6. Verificar mensagens recentes
    console.log('\n📋 6. VERIFICANDO MENSAGENS RECENTES:');
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentMessages, error: recentError } = await supabase
      .from('messages')
      .select('*')
      .gte('sent_at', oneHourAgo)
      .order('sent_at', { ascending: false });
    
    if (recentError) {
      console.log(`❌ Erro ao buscar mensagens recentes: ${recentError.message}`);
    } else {
      console.log(`✅ ${recentMessages.length} mensagens na última hora:`);
      
      const clientMessages = recentMessages.filter(msg => msg.sender === 'client');
      const userMessages = recentMessages.filter(msg => msg.sender === 'user');
      
      console.log(`   📥 Mensagens recebidas (client): ${clientMessages.length}`);
      console.log(`   📤 Mensagens enviadas (user): ${userMessages.length}`);
      
      clientMessages.forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.sent_at}] ${msg.content?.substring(0, 30)}...`);
        console.log(`      Remote JID: ${msg.remote_jid || 'NULL'}`);
        console.log(`      Instance: ${msg.instance_name || 'NULL'}`);
        console.log(`      Message ID: ${msg.message_id || 'NULL'}`);
      });
    }
    
    // 7. Análise final
    console.log('\n🎯 ANÁLISE FINAL');
    console.log('='.repeat(60));
    
    console.log('🔍 POSSÍVEIS CAUSAS PARA MENSAGENS REAIS NÃO CHEGAREM:');
    console.log('   1. Instância não está conectada');
    console.log('   2. Webhook não está configurado corretamente');
    console.log('   3. Evolution API não está enviando webhooks');
    console.log('   4. Problema de rede/firewall');
    console.log('   5. URL do webhook incorreta');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('   1. Verificar se a instância está conectada');
    console.log('   2. Reconfigurar webhook na Evolution API');
    console.log('   3. Verificar logs da Evolution API');
    console.log('   4. Testar com uma mensagem real');
    console.log('   5. Verificar se há erros na Evolution API');
    
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('   1. Conectar a instância "chat saira"');
    console.log('   2. Verificar se o webhook está habilitado');
    console.log('   3. Enviar uma mensagem real do WhatsApp');
    console.log('   4. Verificar logs do webhook no Supabase');
    
  } catch (error) {
    console.log(`❌ ERRO GERAL: ${error.message}`);
  }
}

checkEvolutionApiConfig(); 