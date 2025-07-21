// Script para testar o frontend e debugar problemas
// Execute: node debug_frontend.js

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

console.log('🔍 INICIANDO DEBUG DO FRONTEND');

// 1. Verificar variáveis de ambiente
const SUPABASE_URL = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';
const FUNCTIONS_URL = 'https://svkgfvfhmngcvfsjpero.supabase.co/functions/v1';

console.log('📋 Variáveis de ambiente:');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY.substring(0, 50) + '...');
console.log('FUNCTIONS_URL:', FUNCTIONS_URL);

// 2. Testar conexão com Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. Testar busca de conversas
console.log('\n🔍 Testando busca de conversas...');
try {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      id,
      client_id,
      status,
      started_at,
      assigned_to,
      clients (name, phone)
    `)
    .order('started_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ Erro ao buscar conversas:', error);
  } else {
    console.log('✅ Conversas encontradas:', conversations);
  }
} catch (err) {
  console.error('❌ Erro na busca de conversas:', err);
}

// 4. Testar busca de settings
console.log('\n🔍 Testando busca de settings...');
try {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', 'fe39cc23-b68b-4526-a514-c92b877cac0c');
  
  if (error) {
    console.error('❌ Erro ao buscar settings:', error);
  } else {
    console.log('✅ Settings encontradas:', settings);
  }
} catch (err) {
  console.error('❌ Erro na busca de settings:', err);
}

// 5. Testar função send-message com ID real da conversa
console.log('\n🔍 Testando função send-message...');
try {
  const response = await fetch(`${FUNCTIONS_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      conversationId: '58ad0270-cc35-4a26-ab20-0b32ba41d7f6', // ID real da conversa
      text: 'Teste de debug via terminal',
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
} catch (err) {
  console.error('❌ Erro na função send-message:', err);
}

// 6. Testar busca de clientes
console.log('\n🔍 Testando busca de clientes...');
try {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', '556481140676');
  
  if (error) {
    console.error('❌ Erro ao buscar clientes:', error);
  } else {
    console.log('✅ Clientes encontrados:', clients);
  }
} catch (err) {
  console.error('❌ Erro na busca de clientes:', err);
}

// 7. Testar busca de mensagens
console.log('\n🔍 Testando busca de mensagens...');
try {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', '58ad0270-cc35-4a26-ab20-0b32ba41d7f6')
    .order('sent_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
  } else {
    console.log('✅ Mensagens encontradas:', messages);
  }
} catch (err) {
  console.error('❌ Erro na busca de mensagens:', err);
}

console.log('\n�� DEBUG CONCLUÍDO'); 