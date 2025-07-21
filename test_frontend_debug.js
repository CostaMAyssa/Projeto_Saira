// Script para testar o frontend e debugar problemas
// Execute no console do navegador

console.log('🔍 INICIANDO DEBUG DO FRONTEND');

// 1. Verificar variáveis de ambiente
console.log('📋 Variáveis de ambiente:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 50) + '...');
console.log('VITE_SUPABASE_FUNCTIONS_URL:', import.meta.env.VITE_SUPABASE_FUNCTIONS_URL);

// 2. Testar conexão com Supabase
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 3. Testar busca de conversas
console.log('🔍 Testando busca de conversas...');
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
console.log('🔍 Testando busca de settings...');
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

// 5. Testar função send-message
console.log('🔍 Testando função send-message...');
try {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      conversationId: 'test-conversation-id',
      text: 'Teste de debug',
      userId: 'fe39cc23-b68b-4526-a514-c92b877cac0c',
      evolutionInstance: 'caldasIA',
      clientPhone: '556481140676',
      clientName: 'Teste Debug',
      clientId: 'test-client-id'
    })
  });
  
  const result = await response.json();
  console.log('✅ Resposta da função send-message:', result);
  console.log('📊 Status da resposta:', response.status);
} catch (err) {
  console.error('❌ Erro na função send-message:', err);
}

// 6. Testar busca de clientes
console.log('🔍 Testando busca de clientes...');
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

console.log('�� DEBUG CONCLUÍDO'); 