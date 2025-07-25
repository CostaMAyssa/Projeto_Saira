rodeiimport { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 CORREÇÃO COMPLETA DO REALTIME');
console.log('================================');

async function fixRealtimeComplete() {
  try {
    // 1. Verificar status atual do Realtime
    console.log('\n1. 🔍 Verificando status do Realtime...');
    
    const { data: debugData, error: debugError } = await supabase
      .rpc('debug_realtime_status');

    if (debugError) {
      console.log('⚠️ Função de debug não encontrada, continuando...');
    } else {
      console.log('📊 Status das tabelas:');
      debugData.forEach(row => {
        console.log(`   ${row.table_name}: Realtime=${row.realtime_enabled}, RLS=${row.rls_enabled}, Políticas=${row.policy_count}`);
      });
    }

    // 2. Testar conexão básica
    console.log('\n2. 🔗 Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return;
    }
    console.log('✅ Conexão básica OK');

    // 3. Buscar conversas com estrutura correta
    console.log('\n3. 📋 Buscando conversas com estrutura correta...');
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
      .order('last_message_at', { ascending: false })
      .limit(3);

    if (convError) {
      console.error('❌ Erro ao buscar conversas:', convError);
      return;
    }

    console.log(`✅ ${conversations.length} conversas encontradas`);
    conversations.forEach((conv, index) => {
      const clientName = conv.clients?.name || 'Cliente sem nome';
      console.log(`   ${index + 1}. ${clientName} (ID: ${conv.id})`);
    });

    if (conversations.length === 0) {
      console.log('❌ Nenhuma conversa encontrada');
      return;
    }

    const testConversation = conversations[0];
    const clientName = testConversation.clients?.name || 'Cliente sem nome';

    // 4. Testar Realtime com configuração simples
    console.log(`\n4. 📡 Testando Realtime para: ${clientName}`);
    
    let messageReceived = false;
    let channelError = false;

    const channel = supabase
      .channel('test-realtime-simple')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Evento Realtime recebido!');
          console.log('   Tipo:', payload.eventType);
          console.log('   Tabela:', payload.table);
          console.log('   ID:', payload.new?.id || payload.old?.id);
          messageReceived = true;
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status do canal: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal Realtime conectado com sucesso!');
          console.log('💡 Aguardando eventos por 15 segundos...');
          
          // Simular inserção de mensagem para testar
          setTimeout(async () => {
            console.log('\n🧪 Inserindo mensagem de teste...');
            try {
              const { error: insertError } = await supabase
                .from('messages')
                .insert({
                  conversation_id: testConversation.id,
                  content: `Teste Realtime - ${new Date().toISOString()}`,
                  sender: 'user',
                  sent_at: new Date().toISOString(),
                  message_type: 'text'
                });

              if (insertError) {
                console.error('❌ Erro ao inserir mensagem de teste:', insertError);
              } else {
                console.log('✅ Mensagem de teste inserida');
              }
            } catch (error) {
              console.error('❌ Erro na inserção:', error);
            }
          }, 3000);

          // Finalizar teste após 15 segundos
          setTimeout(() => {
            console.log('\n📊 RESULTADO DO TESTE:');
            console.log(`   Mensagem recebida via Realtime: ${messageReceived ? '✅ SIM' : '❌ NÃO'}`);
            console.log(`   Erro no canal: ${channelError ? '❌ SIM' : '✅ NÃO'}`);
            
            if (messageReceived && !channelError) {
              console.log('\n🎉 REALTIME FUNCIONANDO PERFEITAMENTE!');
            } else {
              console.log('\n⚠️ Realtime com problemas. Verifique as políticas RLS.');
            }

            channel.unsubscribe();
            process.exit(0);
          }, 15000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro no canal Realtime');
          channelError = true;
        }
      });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixRealtimeComplete();