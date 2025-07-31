const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function explainDashboardLogic() {
  console.log('🔍 EXPLICANDO A LÓGICA DO DASHBOARD\n');
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  console.log('📅 Período: últimas 24 horas');
  console.log('⏰ Data de corte:', twentyFourHoursAgo);
  console.log('⏰ Agora:', new Date().toISOString());
  console.log('');

  console.log('📊 LÓGICA ATUAL DO DASHBOARD:');
  console.log('   ✅ Busca conversas com status = "active"');
  console.log('   ✅ Que INICIARAM (started_at) nas últimas 24 horas');
  console.log('   ❌ NÃO considera conversas antigas que tiveram atividade recente');
  console.log('');

  // Buscar todas as conversas ativas
  const { data: allActiveConversations, error: allError } = await supabase
    .from('conversations')
    .select('id, status, started_at, client_id')
    .eq('status', 'active')
    .order('started_at', { ascending: false });

  if (allError) {
    console.error('❌ Erro:', allError);
    return;
  }

  console.log(`📈 TOTAL DE CONVERSAS ATIVAS: ${allActiveConversations.length}`);
  console.log('');

  // Separar por período
  const recentConversations = allActiveConversations.filter(conv => 
    new Date(conv.started_at) >= new Date(twentyFourHoursAgo)
  );
  
  const oldConversations = allActiveConversations.filter(conv => 
    new Date(conv.started_at) < new Date(twentyFourHoursAgo)
  );

  console.log(`🆕 CONVERSAS QUE INICIARAM NAS ÚLTIMAS 24H: ${recentConversations.length}`);
  console.log('   (Esta é a lógica atual do dashboard)');
  recentConversations.forEach((conv, index) => {
    console.log(`   ${index + 1}. Iniciada: ${conv.started_at} | Cliente: ${conv.client_id.substring(0, 8)}...`);
  });
  console.log('');

  console.log(`🕰️ CONVERSAS ATIVAS MAIS ANTIGAS: ${oldConversations.length}`);
  console.log('   (Estas NÃO são contadas no dashboard atual)');
  oldConversations.forEach((conv, index) => {
    console.log(`   ${index + 1}. Iniciada: ${conv.started_at} | Cliente: ${conv.client_id.substring(0, 8)}...`);
  });
  console.log('');

  // Verificar mensagens recentes
  console.log('📨 VERIFICANDO ATIVIDADE RECENTE:');
  const { data: recentMessages, error: msgError } = await supabase
    .from('messages')
    .select('conversation_id, created_at, content')
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: false });

  if (msgError) {
    console.error('❌ Erro ao buscar mensagens:', msgError);
  } else {
    console.log(`   📩 ${recentMessages.length} mensagens nas últimas 24h`);
    
    // Agrupar por conversa
    const conversationsWithActivity = {};
    recentMessages.forEach(msg => {
      if (!conversationsWithActivity[msg.conversation_id]) {
        conversationsWithActivity[msg.conversation_id] = 0;
      }
      conversationsWithActivity[msg.conversation_id]++;
    });

    console.log(`   💬 ${Object.keys(conversationsWithActivity).length} conversas tiveram atividade`);
    console.log('');

    // Verificar quais conversas ativas tiveram mensagens
    const activeConversationsWithActivity = allActiveConversations.filter(conv => 
      conversationsWithActivity[conv.id]
    );

    console.log(`🎯 CONVERSAS ATIVAS COM ATIVIDADE NAS ÚLTIMAS 24H: ${activeConversationsWithActivity.length}`);
    console.log('   (Esta seria uma lógica alternativa mais útil)');
    activeConversationsWithActivity.forEach((conv, index) => {
      const isRecent = new Date(conv.started_at) >= new Date(twentyFourHoursAgo);
      const msgCount = conversationsWithActivity[conv.id];
      console.log(`   ${index + 1}. ${isRecent ? '🆕 NOVA' : '🕰️ ANTIGA'} | ${msgCount} msgs | Iniciada: ${conv.started_at.substring(0, 16)} | Cliente: ${conv.client_id.substring(0, 8)}...`);
    });
  }

  console.log('\n🤔 RESUMO DO PROBLEMA:');
  console.log('❌ Dashboard atual: Só conta conversas que INICIARAM nas últimas 24h');
  console.log('✅ Você esperava: Conversas que tiveram ATIVIDADE nas últimas 24h');
  console.log('');
  console.log('💡 SUGESTÃO: Mudar a lógica para contar conversas ativas que tiveram mensagens recentes');
}

explainDashboardLogic().catch(console.error);