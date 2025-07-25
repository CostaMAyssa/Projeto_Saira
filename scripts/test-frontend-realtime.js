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

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 TESTE DE REALTIME DO FRONTEND');
console.log('================================');

async function testFrontendRealtime() {
  try {
    // 1. Buscar conversas ativas
    console.log('\n1. 📋 Buscando conversas ativas...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(5);

    if (convError) {
      console.error('❌ Erro ao buscar conversas:', convError);
      return;
    }

    console.log(`✅ ${conversations.length} conversas encontradas`);
    conversations.forEach((conv, index) => {
      console.log(`   ${index + 1}. ${conv.contact_name} (ID: ${conv.id})`);
      console.log(`      Última mensagem: ${conv.last_message_at || 'Nunca'}`);
    });

    if (conversations.length === 0) {
      console.log('❌ Nenhuma conversa encontrada');
      return;
    }

    const testConversation = conversations[0];
    console.log(`\n2. 🔍 Testando Realtime para conversa: ${testConversation.contact_name}`);

    // 2. Buscar mensagens da conversa
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', testConversation.id)
      .order('sent_at', { ascending: false })
      .limit(10);

    if (msgError) {
      console.error('❌ Erro ao buscar mensagens:', msgError);
      return;
    }

    console.log(`✅ ${messages.length} mensagens encontradas na conversa`);
    if (messages.length > 0) {
      console.log('   Últimas mensagens:');
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.content?.substring(0, 50)}...`);
        console.log(`      De: ${msg.from_me ? 'Eu' : msg.push_name || 'Cliente'}`);
        console.log(`      Em: ${msg.sent_at}`);
      });
    }

    // 3. Testar subscrição Realtime
    console.log('\n3. 📡 Testando subscrição Realtime...');
    
    const channel = supabase
      .channel(`messages:conversation_id=eq.${testConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${testConversation.id}`
        },
        (payload) => {
          console.log('🔔 Nova mensagem recebida via Realtime!');
          console.log('   Evento:', payload.eventType);
          console.log('   Dados:', {
            id: payload.new?.id,
            content: payload.new?.content?.substring(0, 50) + '...',
            from_me: payload.new?.from_me,
            sent_at: payload.new?.sent_at
          });
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status da subscrição: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscrição ativa! Aguardando mensagens...');
          console.log('💡 Envie uma mensagem no WhatsApp para testar');
          
          // Aguardar 30 segundos
          setTimeout(() => {
            console.log('\n⏰ Tempo de teste finalizado');
            channel.unsubscribe();
            process.exit(0);
          }, 30000);
        }
      });

    // 4. Testar subscrição geral de mensagens
    console.log('\n4. 📡 Testando subscrição geral de mensagens...');
    
    const generalChannel = supabase
      .channel('all-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Nova mensagem geral recebida!');
          console.log('   Conversa ID:', payload.new?.conversation_id);
          console.log('   Conteúdo:', payload.new?.content?.substring(0, 50) + '...');
          console.log('   De mim:', payload.new?.from_me);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status da subscrição geral: ${status}`);
      });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testFrontendRealtime();