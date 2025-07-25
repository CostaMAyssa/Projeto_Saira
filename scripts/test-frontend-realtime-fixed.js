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

console.log('🧪 TESTE DE REALTIME CORRIGIDO');
console.log('==============================');

async function testFrontendRealtimeFixed() {
  try {
    // 1. Buscar conversas com clientes (estrutura correta)
    console.log('\n1. 📋 Buscando conversas com clientes...');
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
      .limit(5);

    if (convError) {
      console.error('❌ Erro ao buscar conversas:', convError);
      return;
    }

    console.log(`✅ ${conversations.length} conversas encontradas`);
    conversations.forEach((conv, index) => {
      const clientName = conv.clients?.name || 'Cliente sem nome';
      const clientPhone = conv.clients?.phone || 'Sem telefone';
      console.log(`   ${index + 1}. ${clientName} (${clientPhone})`);
      console.log(`      ID: ${conv.id}`);
      console.log(`      Última mensagem: ${conv.last_message_at || 'Nunca'}`);
    });

    if (conversations.length === 0) {
      console.log('❌ Nenhuma conversa ativa encontrada');
      return;
    }

    const testConversation = conversations[0];
    const clientName = testConversation.clients?.name || 'Cliente sem nome';
    
    console.log(`\n2. 🔍 Testando conversa: ${clientName}`);

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
        const sender = msg.from_me ? 'Eu' : (msg.push_name || clientName);
        console.log(`   ${index + 1}. ${msg.content?.substring(0, 50)}...`);
        console.log(`      De: ${sender}`);
        console.log(`      Em: ${msg.sent_at}`);
      });
    }

    // 3. Testar subscrição Realtime específica
    console.log('\n3. 📡 Testando subscrição Realtime específica...');
    
    const specificChannel = supabase
      .channel(`messages-${testConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${testConversation.id}`
        },
        (payload) => {
          console.log('🔔 Nova mensagem na conversa específica!');
          console.log('   Evento:', payload.eventType);
          console.log('   Conteúdo:', payload.new?.content?.substring(0, 50) + '...');
          console.log('   De mim:', payload.new?.from_me);
          console.log('   Enviado em:', payload.new?.sent_at);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status da subscrição específica: ${status}`);
      });

    // 4. Testar subscrição geral
    console.log('\n4. 📡 Testando subscrição geral...');
    
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
          console.log('🔔 Nova mensagem geral!');
          console.log('   Conversa ID:', payload.new?.conversation_id);
          console.log('   Conteúdo:', payload.new?.content?.substring(0, 50) + '...');
          console.log('   De mim:', payload.new?.from_me);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status da subscrição geral: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('\n✅ Ambas as subscrições ativas!');
          console.log('💡 Envie uma mensagem no WhatsApp para testar');
          console.log('⏰ Aguardando por 30 segundos...');
          
          // Aguardar 30 segundos
          setTimeout(() => {
            console.log('\n⏰ Tempo de teste finalizado');
            specificChannel.unsubscribe();
            generalChannel.unsubscribe();
            process.exit(0);
          }, 30000);
        }
      });

    // 5. Verificar se há mensagens órfãs
    console.log('\n5. 🔍 Verificando mensagens órfãs...');
    const { data: orphanMessages, error: orphanError } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        content,
        sent_at
      `)
      .is('conversation_id', null)
      .limit(5);

    if (orphanError) {
      console.error('❌ Erro ao buscar mensagens órfãs:', orphanError);
    } else {
      console.log(`📊 ${orphanMessages.length} mensagens órfãs encontradas`);
      if (orphanMessages.length > 0) {
        orphanMessages.forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg.content?.substring(0, 50)}... (${msg.sent_at})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testFrontendRealtimeFixed();