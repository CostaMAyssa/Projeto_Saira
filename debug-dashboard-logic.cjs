const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixqjqfkqjqjqjqjqjqjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxZmtxanFqcWpxanFqcWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzQ0MDAsImV4cCI6MjA1MTE1MDQwMH0.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDashboardLogic() {
  console.log('🔍 ANALISANDO A LÓGICA DO DASHBOARD\n');
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  console.log('📅 Período analisado: últimas 24 horas');
  console.log('⏰ Data de corte:', twentyFourHoursAgo);
  console.log('⏰ Agora:', new Date().toISOString());
  console.log('');

  // 1. LÓGICA ATUAL: Conversas ATIVAS que INICIARAM nas últimas 24h
  console.log('📊 LÓGICA ATUAL DO DASHBOARD:');
  console.log('   - Busca conversas com status = "active"');
  console.log('   - Que INICIARAM (started_at) nas últimas 24 horas');
  console.log('');

  const { data: currentLogic, error: currentError } = await supabase
    .from('conversations')
    .select('id, status, started_at, client_id')
    .eq('status', 'active')
    .gte('started_at', twentyFourHoursAgo);

  if (currentError) {
    console.error('❌ Erro na consulta atual:', currentError);
    return;
  }

  console.log(`✅ RESULTADO ATUAL: ${currentLogic.length} conversas`);
  currentLogic.forEach((conv, index) => {
    console.log(`   ${index + 1}. ID: ${conv.id.substring(0, 8)}... | Iniciada: ${conv.started_at} | Cliente: ${conv.client_id.substring(0, 8)}...`);
  });
  console.log('');

  // 2. LÓGICA ALTERNATIVA: Todas as conversas ATIVAS (independente de quando iniciaram)
  console.log('📊 LÓGICA ALTERNATIVA (todas as conversas ativas):');
  console.log('   - Busca conversas com status = "active"');
  console.log('   - SEM filtro de data de início');
  console.log('');

  const { data: allActive, error: allActiveError } = await supabase
    .from('conversations')
    .select('id, status, started_at, client_id')
    .eq('status', 'active');

  if (allActiveError) {
    console.error('❌ Erro na consulta alternativa:', allActiveError);
    return;
  }

  console.log(`✅ RESULTADO ALTERNATIVO: ${allActive.length} conversas ativas`);
  allActive.forEach((conv, index) => {
    const isRecent = new Date(conv.started_at) >= new Date(twentyFourHoursAgo);
    console.log(`   ${index + 1}. ID: ${conv.id.substring(0, 8)}... | Iniciada: ${conv.started_at} | ${isRecent ? '🆕 RECENTE' : '🕰️ ANTIGA'} | Cliente: ${conv.client_id.substring(0, 8)}...`);
  });
  console.log('');

  // 3. LÓGICA ALTERNATIVA 2: Conversas que tiveram ATIVIDADE nas últimas 24h
  console.log('📊 LÓGICA ALTERNATIVA 2 (atividade recente):');
  console.log('   - Busca conversas com status = "active"');
  console.log('   - Que tiveram mensagens nas últimas 24 horas');
  console.log('');

  const { data: recentActivity, error: recentError } = await supabase
    .from('conversations')
    .select(`
      id, 
      status, 
      started_at, 
      client_id,
      messages!inner(created_at)
    `)
    .eq('status', 'active')
    .gte('messages.created_at', twentyFourHoursAgo);

  if (recentError) {
    console.error('❌ Erro na consulta de atividade recente:', recentError);
  } else {
    console.log(`✅ RESULTADO ATIVIDADE RECENTE: ${recentActivity.length} conversas`);
    recentActivity.forEach((conv, index) => {
      console.log(`   ${index + 1}. ID: ${conv.id.substring(0, 8)}... | Iniciada: ${conv.started_at} | Cliente: ${conv.client_id.substring(0, 8)}...`);
    });
  }
  console.log('');

  // 4. Verificar mensagens recentes
  console.log('📨 MENSAGENS DAS ÚLTIMAS 24 HORAS:');
  const { data: recentMessages, error: msgError } = await supabase
    .from('messages')
    .select('id, conversation_id, created_at, content')
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false })
    .limit(10);

  if (msgError) {
    console.error('❌ Erro ao buscar mensagens:', msgError);
  } else {
    console.log(`✅ ${recentMessages.length} mensagens encontradas:`);
    recentMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. Conversa: ${msg.conversation_id.substring(0, 8)}... | ${msg.created_at} | "${msg.content?.substring(0, 50)}..."`);
    });
  }

  console.log('\n🤔 QUAL LÓGICA VOCÊ ESPERAVA?');
  console.log('A) Conversas que INICIARAM nas últimas 24h (atual)');
  console.log('B) Todas as conversas ATIVAS (independente de quando iniciaram)');
  console.log('C) Conversas que tiveram ATIVIDADE/MENSAGENS nas últimas 24h');
}

debugDashboardLogic().catch(console.error);