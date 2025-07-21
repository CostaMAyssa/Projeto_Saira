// Teste com áudio base64 válido
import fetch from 'node-fetch';

console.log('🎤 TESTE COM ÁUDIO VÁLIDO');

const FUNCTIONS_URL = 'https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar um base64 válido simples
const simpleText = 'Hello World Audio Test';
const validBase64 = Buffer.from(simpleText, 'utf8').toString('base64');

console.log('📋 Base64 válido:', validBase64);
console.log('📏 Tamanho:', validBase64.length);

console.log('📋 Enviando áudio válido...');
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
        base64: validBase64,
        name: 'test-audio-valid.txt',
        type: 'text/plain'
      },
      userId: 'fe39cc23-b68b-4526-a514-c92b877cac0c',
      evolutionInstance: 'caldasIA',
      clientPhone: '556481140676',
      clientName: 'Mayssa Ferreira',
      clientId: '2db4fe30-3b6e-467f-80fe-919888e77b97'
    })
  });
  
  const result = await response.json();
  console.log('✅ Resultado:', result);
  console.log('📊 Status:', response.status);
} catch (err) {
  console.error('❌ Erro:', err);
}

console.log('�� TESTE CONCLUÍDO'); 