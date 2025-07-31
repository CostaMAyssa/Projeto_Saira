import { config } from 'dotenv';

// Carregar variáveis do .env.local
config({ path: '.env.local' });

console.log('🔍 Testando conectividade do webhook...\n');

// Simular payload de mensagem do WhatsApp
const testPayload = {
  "instance": "green-pharmacy",
  "data": {
    "key": {
      "remoteJid": "5564992019427@s.whatsapp.net",
      "fromMe": false,
      "id": `test_${Date.now()}`
    },
    "pushName": "Teste Webhook",
    "message": {
      "conversation": "Teste de mensagem do webhook"
    },
    "messageTimestamp": Math.floor(Date.now() / 1000)
  }
};

async function testWebhook() {
  try {
    console.log('📡 Enviando payload de teste para o webhook...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const webhookUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver`;
    
    console.log(`\n🎯 URL do webhook: ${webhookUrl}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`\n📊 Status da resposta: ${response.status}`);
    console.log(`📊 Status text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📊 Resposta: ${responseText}`);
    
    if (response.ok) {
      console.log('\n✅ Webhook respondeu com sucesso!');
      console.log('🔍 Agora verifique se a mensagem apareceu no banco de dados');
    } else {
      console.log('\n❌ Webhook falhou!');
      console.log('🔧 Verifique os logs do Supabase Edge Functions');
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao testar webhook:', error);
  }
}

// Função para verificar se a mensagem foi inserida
async function checkMessageInDatabase() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    console.log('\n🔍 Verificando se a mensagem foi inserida no banco...');
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .ilike('content', '%Teste de mensagem do webhook%')
      .order('sent_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao buscar mensagem:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Mensagem encontrada no banco:', data[0]);
    } else {
      console.log('❌ Mensagem não encontrada no banco');
      console.log('🔧 Isso indica que o webhook não está processando corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  }
}

async function main() {
  await testWebhook();
  
  // Aguardar um pouco antes de verificar o banco
  console.log('\n⏳ Aguardando 3 segundos antes de verificar o banco...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await checkMessageInDatabase();
  
  console.log('\n📋 RESUMO DO TESTE:');
  console.log('1. Se o webhook respondeu 200/ok E a mensagem foi encontrada no banco = ✅ Tudo funcionando');
  console.log('2. Se o webhook respondeu 200/ok MAS a mensagem NÃO foi encontrada = ❌ Problema no processamento');
  console.log('3. Se o webhook NÃO respondeu 200/ok = ❌ Problema na configuração do webhook');
}

main();