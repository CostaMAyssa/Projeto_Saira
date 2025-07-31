import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis do .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔔 Testando conexão Realtime do Supabase...\n');

// Função para testar realtime em uma conversa específica
async function testRealtimeForConversation(conversationId) {
  console.log(`📡 Testando realtime para conversa: ${conversationId}`);
  
  const channel = supabase
    .channel(`test-messages-${conversationId}`)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('🎉 NOVA MENSAGEM RECEBIDA VIA REALTIME:', {
          id: payload.new.id,
          content: payload.new.content,
          sender: payload.new.sender,
          conversation_id: payload.new.conversation_id,
          sent_at: payload.new.sent_at
        });
      }
    )
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('🔄 MENSAGEM ATUALIZADA VIA REALTIME:', {
          id: payload.new.id,
          content: payload.new.content,
          sender: payload.new.sender
        });
      }
    )
    .subscribe((status) => {
      console.log(`📡 Status do canal realtime: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Canal realtime conectado com sucesso!');
      } else if (status === 'CHANNEL_ERROR') {
        console.log('❌ Erro na conexão do canal realtime');
      } else if (status === 'TIMED_OUT') {
        console.log('⏰ Timeout na conexão do canal realtime');
      } else if (status === 'CLOSED') {
        console.log('🔌 Canal realtime fechado');
      }
    });

  return channel;
}

// Função para inserir uma mensagem de teste
async function insertTestMessage(conversationId) {
  console.log(`\n💾 Inserindo mensagem de teste na conversa ${conversationId}...`);
  
  const testMessage = {
    conversation_id: conversationId,
    content: `Teste Realtime - ${new Date().toLocaleString('pt-BR')}`,
    sender: 'client',
    sent_at: new Date().toISOString(),
    message_type: 'text',
    from_me: false,
    message_id: `test_${Date.now()}`,
    remote_jid: '5564992019427@s.whatsapp.net',
    instance_name: 'test',
    push_name: 'Teste Realtime'
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(testMessage)
    .select();

  if (error) {
    console.error('❌ Erro ao inserir mensagem de teste:', error);
    return null;
  } else {
    console.log('✅ Mensagem de teste inserida:', data[0]);
    return data[0];
  }
}

// Função principal
async function main() {
  try {
    // 1. Buscar uma conversa existente
    console.log('🔍 Buscando conversas existentes...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, client_id')
      .limit(1);

    if (convError || !conversations || conversations.length === 0) {
      console.error('❌ Nenhuma conversa encontrada:', convError);
      return;
    }

    const conversationId = conversations[0].id;
    console.log(`✅ Conversa encontrada: ${conversationId}\n`);

    // 2. Configurar listener realtime
    const channel = await testRealtimeForConversation(conversationId);

    // 3. Aguardar um pouco para garantir que o canal está conectado
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Inserir mensagem de teste
    await insertTestMessage(conversationId);

    // 5. Aguardar para ver se o realtime funciona
    console.log('\n⏳ Aguardando 10 segundos para verificar se o realtime funciona...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 6. Limpar
    console.log('\n🧹 Limpando conexões...');
    supabase.removeChannel(channel);
    
    console.log('\n✅ Teste finalizado!');
    console.log('\n📝 INSTRUÇÕES:');
    console.log('1. Se você viu "NOVA MENSAGEM RECEBIDA VIA REALTIME", o realtime está funcionando');
    console.log('2. Se não viu, há um problema na configuração do realtime');
    console.log('3. Verifique se o RLS está configurado corretamente');
    console.log('4. Verifique se as políticas permitem SELECT para usuários anônimos');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
  
  process.exit(0);
}

main();