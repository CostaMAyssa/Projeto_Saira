import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Função para carregar variáveis do .env.local
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    }
  }
  
  return envVars;
}

// Carregar configurações
const env = loadEnvLocal();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configurações do Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO DE MENSAGENS');
console.log('==========================');

async function diagnoseMessages() {
  try {
    // 1. Verificar conexão com Supabase
    console.log('\n1. 🔗 Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError.message);
      return;
    }
    console.log('✅ Conexão com Supabase OK');

    // 2. Verificar mensagens recentes (últimas 24 horas)
    console.log('\n2. 📨 Verificando mensagens recentes...');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentMessages, error: recentError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender,
        sent_at,
        conversation_id,
        message_type,
        from_me,
        message_id
      `)
      .gte('sent_at', twentyFourHoursAgo)
      .order('sent_at', { ascending: false })
      .limit(20);

    if (recentError) {
      console.error('❌ Erro ao buscar mensagens recentes:', recentError.message);
      return;
    }

    console.log(`✅ Encontradas ${recentMessages?.length || 0} mensagens nas últimas 24h`);
    
    if (recentMessages && recentMessages.length > 0) {
      console.log('\n📋 Últimas mensagens:');
      recentMessages.forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.sent_at}] ${msg.sender}: ${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}`);
        console.log(`   ID: ${msg.id} | Conversa: ${msg.conversation_id} | Tipo: ${msg.message_type || 'text'}`);
      });
    }

    // 3. Verificar conversas ativas
    console.log('\n3. 💬 Verificando conversas ativas...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message_at,
        clients (name, phone)
      `)
      .order('last_message_at', { ascending: false })
      .limit(10);

    if (convError) {
      console.error('❌ Erro ao buscar conversas:', convError.message);
      return;
    }

    console.log(`✅ Encontradas ${conversations?.length || 0} conversas`);
    
    if (conversations && conversations.length > 0) {
      console.log('\n📋 Conversas recentes:');
      conversations.forEach((conv, index) => {
        const client = Array.isArray(conv.clients) ? conv.clients[0] : conv.clients;
        const clientName = client?.name || 'Cliente sem nome';
        const clientPhone = client?.phone || 'Sem telefone';
        console.log(`${index + 1}. ${clientName} (${clientPhone}) - Última mensagem: ${conv.last_message_at}`);
        console.log(`   ID da conversa: ${conv.id}`);
      });
    }

    // 4. Verificar configurações do usuário
    console.log('\n4. ⚙️ Verificando configurações de usuários...');
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select(`
        id,
        user_id,
        evolution_instance_name,
        api_url,
        api_key,
        instance_status
      `);

    if (settingsError) {
      console.error('❌ Erro ao buscar configurações:', settingsError.message);
      return;
    }

    console.log(`✅ Encontradas ${settings?.length || 0} configurações`);
    
    if (settings && settings.length > 0) {
      console.log('\n📋 Configurações:');
      settings.forEach((setting, index) => {
        console.log(`${index + 1}. Usuário: ${setting.user_id}`);
        console.log(`   Instância: ${setting.evolution_instance_name}`);
        console.log(`   Status: ${setting.instance_status || 'N/A'}`);
        console.log(`   API URL: ${setting.api_url ? 'Configurada' : 'Não configurada'}`);
      });
    }

    // 5. Testar realtime
    console.log('\n5. 🔄 Testando Realtime...');
    console.log('Criando subscription de teste...');
    
    const channel = supabase
      .channel('test-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Evento Realtime recebido:', {
            event: payload.eventType,
            table: payload.table,
            messageId: payload.new?.id,
            content: payload.new?.content?.substring(0, 50)
          });
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status do Realtime: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime conectado com sucesso!');
          console.log('💡 Envie uma mensagem pelo WhatsApp para testar...');
          
          // Aguardar 30 segundos para testar
          setTimeout(() => {
            console.log('\n⏰ Teste de Realtime finalizado');
            supabase.removeChannel(channel);
            process.exit(0);
          }, 30000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro no canal Realtime');
          process.exit(1);
        }
      });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar diagnóstico
diagnoseMessages();