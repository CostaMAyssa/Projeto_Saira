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

console.log('🔍 INVESTIGAÇÃO DE ESTRUTURA DAS TABELAS');
console.log('=======================================');

async function investigateTables() {
  try {
    // 1. Verificar estrutura da tabela conversations
    console.log('\n1. 📋 Investigando tabela conversations...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(3);

    if (convError) {
      console.error('❌ Erro ao buscar conversations:', convError);
      return;
    }

    console.log(`✅ ${conversations.length} conversas encontradas`);
    if (conversations.length > 0) {
      console.log('\n📊 Estrutura da primeira conversa:');
      console.log(JSON.stringify(conversations[0], null, 2));
      
      console.log('\n🔑 Campos disponíveis:');
      Object.keys(conversations[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof conversations[0][key]}`);
      });
    }

    // 2. Verificar estrutura da tabela messages
    console.log('\n2. 📨 Investigando tabela messages...');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(3);

    if (msgError) {
      console.error('❌ Erro ao buscar messages:', msgError);
      return;
    }

    console.log(`✅ ${messages.length} mensagens encontradas`);
    if (messages.length > 0) {
      console.log('\n📊 Estrutura da primeira mensagem:');
      console.log(JSON.stringify(messages[0], null, 2));
      
      console.log('\n🔑 Campos disponíveis:');
      Object.keys(messages[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof messages[0][key]}`);
      });
    }

    // 3. Verificar tabela clients
    console.log('\n3. 👥 Investigando tabela clients...');
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .limit(3);

    if (clientError) {
      console.error('❌ Erro ao buscar clients:', clientError);
      return;
    }

    console.log(`✅ ${clients.length} clientes encontrados`);
    if (clients.length > 0) {
      console.log('\n📊 Estrutura do primeiro cliente:');
      console.log(JSON.stringify(clients[0], null, 2));
    }

    // 4. Verificar relacionamentos
    console.log('\n4. 🔗 Verificando relacionamentos...');
    
    // Buscar conversas com clientes
    const { data: conversationsWithClients, error: relError } = await supabase
      .from('conversations')
      .select(`
        id,
        client_id,
        contact_name,
        last_message_at,
        clients (
          id,
          name,
          phone
        )
      `)
      .limit(5);

    if (relError) {
      console.error('❌ Erro ao buscar relacionamentos:', relError);
    } else {
      console.log('✅ Relacionamentos encontrados:');
      conversationsWithClients.forEach((conv, index) => {
        console.log(`\n   ${index + 1}. Conversa ID: ${conv.id}`);
        console.log(`      Client ID: ${conv.client_id}`);
        console.log(`      Contact Name: ${conv.contact_name}`);
        console.log(`      Cliente: ${conv.clients ? JSON.stringify(conv.clients) : 'Não encontrado'}`);
      });
    }

    // 5. Verificar mensagens com conversas
    console.log('\n5. 💬 Verificando mensagens com conversas...');
    const { data: messagesWithConv, error: msgConvError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        conversation_id,
        sent_at,
        from_me,
        conversations (
          id,
          contact_name,
          client_id
        )
      `)
      .limit(5);

    if (msgConvError) {
      console.error('❌ Erro ao buscar mensagens com conversas:', msgConvError);
    } else {
      console.log('✅ Mensagens com conversas:');
      messagesWithConv.forEach((msg, index) => {
        console.log(`\n   ${index + 1}. Mensagem ID: ${msg.id}`);
        console.log(`      Conteúdo: ${msg.content?.substring(0, 50)}...`);
        console.log(`      Conversa ID: ${msg.conversation_id}`);
        console.log(`      Conversa: ${msg.conversations ? JSON.stringify(msg.conversations) : 'Não encontrada'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro na investigação:', error);
  }
}

investigateTables();