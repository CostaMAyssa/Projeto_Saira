// Script para testar com service role key
// Execute: node debug_with_service_role.js

import { createClient } from '@supabase/supabase-js';

console.log('🔍 INICIANDO DEBUG COM SERVICE ROLE');

// Usar service role key para bypass RLS
const SUPABASE_URL = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1NzE0MCwiZXhwIjoyMDY2NDMzMTQwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 1. Verificar se há dados nas tabelas
console.log('\n🔍 Verificando dados nas tabelas...');

try {
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .limit(10);
  
  if (convError) {
    console.error('❌ Erro ao buscar conversas:', convError);
  } else {
    console.log('✅ Conversas encontradas:', conversations?.length || 0);
    if (conversations && conversations.length > 0) {
      console.log('📋 Primeira conversa:', conversations[0]);
    }
  }
} catch (err) {
  console.error('❌ Erro na busca de conversas:', err);
}

try {
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .limit(10);
  
  if (clientError) {
    console.error('❌ Erro ao buscar clientes:', clientError);
  } else {
    console.log('✅ Clientes encontrados:', clients?.length || 0);
    if (clients && clients.length > 0) {
      console.log('📋 Primeiro cliente:', clients[0]);
    }
  }
} catch (err) {
  console.error('❌ Erro na busca de clientes:', err);
}

try {
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .limit(10);
  
  if (msgError) {
    console.error('❌ Erro ao buscar mensagens:', msgError);
  } else {
    console.log('✅ Mensagens encontradas:', messages?.length || 0);
    if (messages && messages.length > 0) {
      console.log('📋 Primeira mensagem:', messages[0]);
    }
  }
} catch (err) {
  console.error('❌ Erro na busca de mensagens:', err);
}

// 2. Buscar dados específicos do cliente
console.log('\n🔍 Buscando dados específicos do cliente...');

try {
  const { data: specificClient, error: specificError } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', '556481140676');
  
  if (specificError) {
    console.error('❌ Erro ao buscar cliente específico:', specificError);
  } else {
    console.log('✅ Cliente específico encontrado:', specificClient);
  }
} catch (err) {
  console.error('❌ Erro na busca do cliente específico:', err);
}

// 3. Buscar conversas do cliente específico
console.log('\n🔍 Buscando conversas do cliente específico...');

try {
  const { data: specificConversations, error: convSpecificError } = await supabase
    .from('conversations')
    .select(`
      *,
      clients (name, phone)
    `)
    .eq('clients.phone', '556481140676');
  
  if (convSpecificError) {
    console.error('❌ Erro ao buscar conversas específicas:', convSpecificError);
  } else {
    console.log('✅ Conversas específicas encontradas:', specificConversations);
  }
} catch (err) {
  console.error('❌ Erro na busca das conversas específicas:', err);
}

console.log('\n🏁 DEBUG COM SERVICE ROLE CONCLUÍDO'); 