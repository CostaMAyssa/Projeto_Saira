import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/['"]/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

// Criar cliente com configurações de debug
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

console.log('🔍 AUDITORIA COMPLETA DO REALTIME');
console.log('=================================');
console.log(`🌐 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);

async function auditRealtimeComplete() {
  try {
    // 1. Verificar configurações do Realtime
    console.log('\n1. 🔧 VERIFICANDO CONFIGURAÇÕES DO REALTIME');
    console.log('============================================');
    
    // Testar conexão básica
    const { data: testData, error: testError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão básica:', testError);
      return;
    }
    
    console.log('✅ Conexão básica funcionando');

    // 2. Verificar políticas RLS
    console.log('\n2. 🛡️ VERIFICANDO POLÍTICAS RLS');
    console.log('===============================');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'messages' })
      .catch(() => ({ data: null, error: 'RPC não disponível' }));
    
    if (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas RLS automaticamente');
      console.log('   Verifique manualmente no Supabase Dashboard');
    } else {
      console.log('✅ Políticas RLS verificadas');
    }

    // 3. Verificar publicações Realtime
    console.log('\n3. 📡 VERIFICANDO PUBLICAÇÕES REALTIME');
    console.log('=====================================');
    
    const { data: publications, error: pubError } = await supabase
      .from('pg_publication_tables')
      .select('*')
      .eq('pubname', 'supabase_realtime')
      .in('tablename', ['messages', 'conversations', 'clients']);
    
    if (pubError) {
      console.log('⚠️ Não foi possível verificar publicações:', pubError.message);
    } else {
      console.log(`✅ ${publications.length} tabelas publicadas no Realtime:`);
      publications.forEach(pub => {
        console.log(`   - ${pub.tablename}`);
      });
    }

    // 4. Testar estrutura de dados
    console.log('\n4. 📊 VERIFICANDO ESTRUTURA DE DADOS');
    console.log('===================================');
    
    // Buscar conversas com a estrutura que o frontend espera
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        client_id,
        status,
        last_message_at,
        clients (
          id,
          name,
          phone
        )
      `)
      .eq('status', 'active')
      .limit(3);

    if (convError) {
      console.error('❌ Erro na estrutura de conversas:', convError);
      return;
    }

    console.log(`✅ ${conversations.length} conversas encontradas`);
    conversations.forEach((conv, index) => {
      const clientName = conv.clients?.name || '❌ NOME INDEFINIDO';
      const clientPhone = conv.clients?.phone || '❌ TELEFONE INDEFINIDO';
      console.log(`   ${index + 1}. ${clientName} (${clientPhone})`);
      console.log(`      ID: ${conv.id}`);
      console.log(`      Status: ${conv.status}`);
      console.log(`      Última mensagem: ${conv.last_message_at || '❌ NUNCA'}`);
    });

    if (conversations.length === 0) {
      console.log('❌ Nenhuma conversa ativa encontrada');
      return;
    }

    // 5. Verificar mensagens
    console.log('\n5. 💬 VERIFICANDO MENSAGENS');
    console.log('===========================');
    
    const testConv = conversations[0];
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', testConv.id)
      .order('sent_at', { ascending: false })
      .limit(5);

    if (msgError) {
      console.error('❌ Erro ao buscar mensagens:', msgError);
    } else {
      console.log(`✅ ${messages.length} mensagens encontradas`);
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.content?.substring(0, 50)}...`);
        console.log(`      ID: ${msg.id}`);
        console.log(`      Conversa: ${msg.conversation_id}`);
        console.log(`      De mim: ${msg.from_me}`);
        console.log(`      Enviado: ${msg.sent_at}`);
      });
    }

    // 6. Testar Realtime com logs detalhados
    console.log('\n6. 🔴 TESTANDO REALTIME COM LOGS DETALHADOS');
    console.log('===========================================');
    
    let subscriptionCount = 0;
    let errorCount = 0;
    let eventCount = 0;

    // Canal específico com logs detalhados
    const specificChannel = supabase
      .channel(`audit-messages-${testConv.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${testConv.id}`
        },
        (payload) => {
          eventCount++;
          console.log(`🔔 [${new Date().toISOString()}] EVENTO RECEBIDO #${eventCount}`);
          console.log('   Tipo:', payload.eventType);
          console.log('   Tabela:', payload.table);
          console.log('   Schema:', payload.schema);
          console.log('   Dados:', JSON.stringify(payload.new, null, 2));
        }
      )
      .subscribe((status, err) => {
        console.log(`📡 [${new Date().toISOString()}] Status específico: ${status}`);
        
        if (err) {
          errorCount++;
          console.error(`❌ [${new Date().toISOString()}] Erro #${errorCount}:`, err);
        }
        
        if (status === 'SUBSCRIBED') {
          subscriptionCount++;
          console.log(`✅ [${new Date().toISOString()}] Subscrição específica ativa (#${subscriptionCount})`);
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error(`❌ [${new Date().toISOString()}] CHANNEL_ERROR detectado!`);
          console.error('   Isso indica problema de permissões ou configuração');
        }
        
        if (status === 'CLOSED') {
          console.log(`🔒 [${new Date().toISOString()}] Canal fechado`);
        }
      });

    // Canal geral com logs detalhados
    const generalChannel = supabase
      .channel('audit-all-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          eventCount++;
          console.log(`🔔 [${new Date().toISOString()}] EVENTO GERAL #${eventCount}`);
          console.log('   Conversa:', payload.new?.conversation_id);
          console.log('   Conteúdo:', payload.new?.content?.substring(0, 30) + '...');
        }
      )
      .subscribe((status, err) => {
        console.log(`📡 [${new Date().toISOString()}] Status geral: ${status}`);
        
        if (err) {
          errorCount++;
          console.error(`❌ [${new Date().toISOString()}] Erro geral #${errorCount}:`, err);
        }
        
        if (status === 'SUBSCRIBED') {
          subscriptionCount++;
          console.log(`✅ [${new Date().toISOString()}] Subscrição geral ativa (#${subscriptionCount})`);
          
          if (subscriptionCount >= 2) {
            console.log('\n🎯 AMBAS AS SUBSCRIÇÕES ATIVAS!');
            console.log('💡 Agora vou inserir uma mensagem de teste...');
            
            // Inserir mensagem de teste após 2 segundos
            setTimeout(async () => {
              try {
                const testMessage = {
                  conversation_id: testConv.id,
                  content: `Teste de auditoria - ${new Date().toISOString()}`,
                  from_me: false,
                  sent_at: new Date().toISOString(),
                  message_id: `test-${Date.now()}`,
                  push_name: 'Sistema de Teste'
                };
                
                console.log('\n📤 Inserindo mensagem de teste...');
                const { data: insertData, error: insertError } = await supabase
                  .from('messages')
                  .insert(testMessage)
                  .select();
                
                if (insertError) {
                  console.error('❌ Erro ao inserir mensagem de teste:', insertError);
                } else {
                  console.log('✅ Mensagem de teste inserida:', insertData[0]?.id);
                }
              } catch (error) {
                console.error('❌ Erro na inserção de teste:', error);
              }
            }, 2000);
            
            // Finalizar teste após 15 segundos
            setTimeout(() => {
              console.log('\n📊 RESUMO DA AUDITORIA');
              console.log('======================');
              console.log(`📡 Subscrições ativas: ${subscriptionCount}`);
              console.log(`❌ Erros encontrados: ${errorCount}`);
              console.log(`🔔 Eventos recebidos: ${eventCount}`);
              
              if (eventCount === 0) {
                console.log('\n❌ PROBLEMA IDENTIFICADO: Nenhum evento Realtime recebido');
                console.log('   Possíveis causas:');
                console.log('   1. Políticas RLS muito restritivas');
                console.log('   2. Tabela não publicada no Realtime');
                console.log('   3. Configuração incorreta do Supabase');
                console.log('   4. Problemas de rede/firewall');
              } else {
                console.log('\n✅ Realtime funcionando corretamente!');
              }
              
              specificChannel.unsubscribe();
              generalChannel.unsubscribe();
              process.exit(0);
            }, 15000);
          }
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error(`❌ [${new Date().toISOString()}] CHANNEL_ERROR no canal geral!`);
        }
      });

    // 7. Verificar se o frontend está usando a mesma estrutura
    console.log('\n7. 🖥️ VERIFICANDO COMPATIBILIDADE COM FRONTEND');
    console.log('==============================================');
    
    // Simular a query que o frontend faz
    const { data: frontendConversations, error: frontendError } = await supabase
      .from('conversations')
      .select(`
        id,
        client_id,
        status,
        last_message_at,
        clients!inner (
          id,
          name,
          phone
        )
      `)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (frontendError) {
      console.error('❌ Erro na query do frontend:', frontendError);
      console.log('   O frontend pode estar usando uma estrutura diferente!');
    } else {
      console.log(`✅ Query do frontend funcionando: ${frontendConversations.length} conversas`);
      
      // Verificar se há diferenças
      if (frontendConversations.length !== conversations.length) {
        console.log('⚠️ DIFERENÇA DETECTADA entre queries!');
        console.log(`   Query simples: ${conversations.length} conversas`);
        console.log(`   Query frontend: ${frontendConversations.length} conversas`);
      }
    }

  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
  }
}

auditRealtimeComplete();