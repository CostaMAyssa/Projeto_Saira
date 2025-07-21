// Teste simples de áudio
// Execute: node test_simple_audio.js

import fetch from 'node-fetch';

console.log('🎤 TESTE SIMPLES DE ÁUDIO');

const FUNCTIONS_URL = 'https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Teste 1: Enviar apenas texto primeiro
console.log('\n📝 Teste 1: Enviar texto...');
try {
  const response1 = await fetch(`${FUNCTIONS_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      conversationId: '58ad0270-cc35-4a26-ab20-0b32ba41d7f6',
      text: 'Teste antes do áudio',
      userId: 'fe39cc23-b68b-4526-a514-c92b877cac0c',
      evolutionInstance: 'caldasIA',
      clientPhone: '556481140676',
      clientName: 'Mayssa Ferreira',
      clientId: '2db4fe30-3b6e-467f-80fe-919888e77b97'
    })
  });
  
  const result1 = await response1.json();
  console.log('✅ Texto enviado:', result1.success ? 'SUCESSO' : 'ERRO');
} catch (err) {
  console.error('❌ Erro no texto:', err);
}

// Teste 2: Enviar áudio com base64 mínimo
console.log('\n🎤 Teste 2: Enviar áudio com base64 mínimo...');
try {
  const response2 = await fetch(`${FUNCTIONS_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      conversationId: '58ad0270-cc35-4a26-ab20-0b32ba41d7f6',
      audio: {
        base64: 'SGVsbG8gV29ybGQ=', // "Hello World" em base64
        name: 'test-minimal.webm',
        type: 'audio/webm'
      },
      userId: 'fe39cc23-b68b-4526-a514-c92b877cac0c',
      evolutionInstance: 'caldasIA',
      clientPhone: '556481140676',
      clientName: 'Mayssa Ferreira',
      clientId: '2db4fe30-3b6e-467f-80fe-919888e77b97'
    })
  });
  
  const result2 = await response2.json();
  console.log('✅ Áudio enviado:', result2);
  console.log('📊 Status:', response2.status);
} catch (err) {
  console.error('❌ Erro no áudio:', err);
}

// Teste 3: Verificar mensagens
console.log('\n🔍 Teste 3: Verificar mensagens...');
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
    .order('sent_at', { ascending: false })
    .limit(3);
  
  if (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
  } else {
    console.log('✅ Últimas mensagens:', messages?.map(m => ({
      content: m.content,
      message_type: m.message_type,
      sent_at: m.sent_at
    })));
  }
} catch (err) {
  console.error('❌ Erro na busca:', err);
}

console.log('\n🏁 TESTE SIMPLES CONCLUÍDO'); 