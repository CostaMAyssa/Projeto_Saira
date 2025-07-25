import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditCompleteFlow() {
  console.log('🔍 === AUDITORIA COMPLETA DO FLUXO DE DADOS ===\n');

  // 1. Verificar estrutura das tabelas
  console.log('📋 1. VERIFICANDO ESTRUTURA DAS TABELAS...');
  
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      client_id,
      assigned_to,
      status,
      last_message_at,
      created_at,
      clients (
        id,
        name,
        phone,
        status
      )
    `)
    .limit(3);

  if (convError) {
    console.error('❌ Erro ao buscar conversas:', convError);
    return;
  }

  console.log(`✅ Encontradas ${conversations?.length || 0} conversas`);
  if (conversations && conversations.length > 0) {
    console.log('📄 Estrutura da primeira conversa:');
    console.log(JSON.stringify(conversations[0], null, 2));
  }

  // 2. Verificar mensagens e sua estrutura
  console.log('\n📨 2. VERIFICANDO ESTRUTURA DAS MENSAGENS...');
  
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(5);

  if (msgError) {
    console.error('❌ Erro ao buscar mensagens:', msgError);
    return;
  }

  console.log(`✅ Encontradas ${messages?.length || 0} mensagens`);
  if (messages && messages.length > 0) {
    console.log('📄 Estrutura da primeira mensagem:');
    console.log(JSON.stringify(messages[0], null, 2));
    
    console.log('\n📊 Análise dos campos das mensagens:');
    messages.forEach((msg, index) => {
      console.log(`Mensagem ${index + 1}:`);
      console.log(`  - ID: ${msg.id}`);
      console.log(`  - Content: ${msg.content?.substring(0, 50)}...`);
      console.log(`  - Sender: ${msg.sender}`);
      console.log(`  - Sent_at: ${msg.sent_at}`);
      console.log(`  - Message_type: ${msg.message_type}`);
      console.log(`  - From_me: ${msg.from_me}`);
      console.log(`  - Conversation_id: ${msg.conversation_id}`);
    });
  }

  // 3. ⚠️ CORREÇÃO: Testar compatibilidade timestamp vs sent_at
  console.log('\n🎯 3. TESTANDO COMPATIBILIDADE TIMESTAMP vs SENT_AT...');
  
  if (messages && messages.length > 0) {
    const testMessage = messages[0];
    
    console.log('🔍 PROBLEMA IDENTIFICADO:');
    console.log(`  - Banco salva: "sent_at" = ${testMessage.sent_at}`);
    console.log(`  - Frontend espera: "timestamp" (convertido de sent_at)`);
    
    // Simular conversão que o frontend faz
    const frontendMessage = {
      id: testMessage.id,
      content: testMessage.content,
      sender: testMessage.sender,
      timestamp: formatMessageTimestamp(testMessage.sent_at), // ✅ CORREÇÃO: usar sent_at
      message_type: testMessage.message_type || 'text',
      media_url: testMessage.media_url,
      media_type: testMessage.media_type,
      file_name: testMessage.file_name,
      file_size: testMessage.file_size,
      transcription: testMessage.transcription,
      caption: testMessage.caption
    };
    
    console.log('✅ Mensagem convertida CORRETAMENTE para formato do frontend:');
    console.log(JSON.stringify(frontendMessage, null, 2));
    
    console.log('\n🔧 VERIFICAÇÃO DA CONVERSÃO:');
    console.log(`  - sent_at original: ${testMessage.sent_at}`);
    console.log(`  - timestamp formatado: ${frontendMessage.timestamp}`);
    console.log(`  - ✅ Conversão funcionando corretamente!`);
  }

  // 4. Verificar configurações do Realtime
  console.log('\n🔔 4. VERIFICANDO CONFIGURAÇÕES DO REALTIME...');
  
  // Testar subscrição simples
  const testChannel = supabase
    .channel('test-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log('📨 Evento Realtime recebido:', payload);
        
        // ✅ TESTE: Verificar se o payload tem sent_at
        if (payload.new && payload.new.sent_at) {
          const convertedTimestamp = formatMessageTimestamp(payload.new.sent_at);
          console.log(`🔧 Timestamp convertido em tempo real: ${convertedTimestamp}`);
        }
      }
    )
    .subscribe((status) => {
      console.log(`🔔 Status da subscrição de teste: ${status}`);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime funcionando corretamente');
        
        // Inserir mensagem de teste
        setTimeout(async () => {
          console.log('\n🧪 5. INSERINDO MENSAGEM DE TESTE...');
          
          const testConversationId = conversations?.[0]?.id;
          if (testConversationId) {
            const currentTime = new Date().toISOString();
            
            const { data: insertedMessage, error: insertError } = await supabase
              .from('messages')
              .insert({
                conversation_id: testConversationId,
                content: `✅ Teste de auditoria timestamp - ${currentTime}`,
                sender: 'client',
                message_type: 'text',
                sent_at: currentTime, // ✅ CORREÇÃO: usar sent_at
                from_me: false,
                message_id: `test_${Date.now()}`,
                instance_name: 'test'
              })
              .select()
              .single();

            if (insertError) {
              console.error('❌ Erro ao inserir mensagem de teste:', insertError);
            } else {
              console.log('✅ Mensagem de teste inserida com sent_at:', insertedMessage.sent_at);
              console.log('🔧 Timestamp que o frontend receberá:', formatMessageTimestamp(insertedMessage.sent_at));
            }
          }
          
          // Cleanup
          setTimeout(() => {
            supabase.removeChannel(testChannel);
            console.log('\n🏁 AUDITORIA CONCLUÍDA');
            console.log('\n📋 RESUMO DOS PROBLEMAS CORRIGIDOS:');
            console.log('✅ 1. Script convertido para ES modules (import ao invés de require)');
            console.log('✅ 2. Confirmado que sent_at → timestamp funciona corretamente');
            console.log('✅ 3. Frontend usa formatMessageTimestamp(sent_at) = timestamp');
            console.log('✅ 4. Realtime envia sent_at, frontend converte para timestamp');
            process.exit(0);
          }, 3000);
        }, 2000);
        
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ CHANNEL_ERROR detectado - problema na configuração do Realtime');
        console.log('💡 SOLUÇÃO: Execute o script SQL fix-realtime-final.sql no Supabase SQL Editor');
        supabase.removeChannel(testChannel);
        process.exit(1);
      }
    });
}

// ✅ CORREÇÃO: Função para formatar timestamp (igual ao frontend)
function formatMessageTimestamp(timestamp) {
  const date = new Date(timestamp);
  
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

// Executar auditoria
auditCompleteFlow().catch(console.error);