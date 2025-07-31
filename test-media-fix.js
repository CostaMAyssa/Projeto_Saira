// Script para testar se a correção de mídia está funcionando
// Este script simula uma mensagem de mídia recebida via webhook

const WEBHOOK_URL = 'https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1/webhook-receiver';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const testMediaMessage = {
  instance: 'chat saira', // Nome correto da instância encontrado nos scripts
  data: {
    key: {
      remoteJid: '5511999999999@s.whatsapp.net', // Número de teste
      fromMe: false,
      id: 'test_media_' + Date.now()
    },
    pushName: 'Teste Mídia',
    messageTimestamp: Math.floor(Date.now() / 1000),
    message: {
      imageMessage: {
        url: 'https://example.com/test-image.jpg', // URL de teste
        mimetype: 'image/jpeg',
        caption: 'Teste de imagem',
        fileLength: 12345,
        jpegThumbnail: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      }
    }
  }
};

async function testMediaWebhook() {
  try {
    console.log('🧪 Testando webhook com mensagem de mídia...');
    console.log('📤 Enviando para:', WEBHOOK_URL);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testMediaMessage)
    });
    
    const result = await response.text();
    
    console.log('📥 Status:', response.status);
    console.log('📥 Resposta:', result);
    
    if (response.ok) {
      console.log('✅ Webhook processou a mensagem com sucesso!');
      console.log('🔍 Verifique no dashboard do Supabase se:');
      console.log('   1. A mensagem foi salva na tabela messages');
      console.log('   2. A media_url foi atualizada para o Supabase Storage');
      console.log('   3. Os logs da função mostram o download/upload da mídia');
    } else {
      console.log('❌ Erro no webhook:', response.status, result);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
}

// Executar o teste
testMediaWebhook();