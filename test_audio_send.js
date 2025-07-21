// Script para testar envio de áudio
// Execute: node test_audio_send.js

import fetch from 'node-fetch';

console.log('🎤 TESTANDO ENVIO DE ÁUDIO');

const FUNCTIONS_URL = 'https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// 1. Criar um áudio de teste (base64 válido - WAV file simples)
const testAudioBase64 = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
const testAudioName = 'test-audio.webm';
const testAudioType = 'audio/webm';

console.log('📋 Dados do teste:');
console.log('Conversation ID:', '58ad0270-cc35-4a26-ab20-0b32ba41d7f6');
console.log('Client Phone:', '556481140676');
console.log('Audio Size:', testAudioBase64.length, 'bytes');

// 2. Testar envio de áudio
console.log('\n🎤 Enviando áudio...');
try {
  const response = await fetch(`${FUNCTIONS_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      conversationId: '58ad0270-cc35-4a26-ab20-0b32ba41d7f6',
      audio: {
        base64: testAudioBase64,
        name: testAudioName,
        type: testAudioType
      },
      userId: 'fe39cc23-b68b-4526-a514-c92b877cac0c',
      evolutionInstance: 'caldasIA',
      clientPhone: '556481140676',
      clientName: 'Mayssa Ferreira',
      clientId: '2db4fe30-3b6e-467f-80fe-919888e77b97'
    })
  });
  
  const result = await response.json();
  console.log('✅ Resposta da função send-message:', result);
  console.log('📊 Status da resposta:', response.status);
  
  if (response.ok) {
    console.log('🎉 Áudio enviado com sucesso!');
  } else {
    console.log('❌ Erro ao enviar áudio');
  }
} catch (err) {
  console.error('❌ Erro na função send-message:', err);
}

// 3. Verificar se a mensagem foi salva
console.log('\n🔍 Verificando se a mensagem foi salva...');
try {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    'https://svkgfvfhmngcvfsjpero.supabase.co',
    SUPABASE_ANON_KEY
  );
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', '58ad0270-cc35-4a26-ab20-0b32ba41d7f6')
    .eq('message_type', 'audio')
    .order('sent_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('❌ Erro ao buscar mensagens de áudio:', error);
  } else {
    console.log('✅ Mensagens de áudio encontradas:', messages);
  }
} catch (err) {
  console.error('❌ Erro na busca de mensagens:', err);
}

console.log('\n🏁 TESTE DE ÁUDIO CONCLUÍDO'); 