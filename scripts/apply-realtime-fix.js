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

console.log('🔧 APLICANDO CORREÇÕES DE REALTIME');
console.log('==================================');

async function applyFixes() {
  try {
    // 1. Corrigir last_message_at para conversas existentes
    console.log('\n1. 📅 Corrigindo last_message_at das conversas...');
    
    const { error: updateError } = await supabase.rpc('sql', {
      query: `
        UPDATE public.conversations 
        SET last_message_at = (
          SELECT MAX(sent_at) 
          FROM public.messages 
          WHERE messages.conversation_id = conversations.id
        )
        WHERE EXISTS (
          SELECT 1 
          FROM public.messages 
          WHERE messages.conversation_id = conversations.id
        );
      `
    });

    if (updateError) {
      console.error('❌ Erro ao atualizar last_message_at:', updateError.message);
    } else {
      console.log('✅ last_message_at atualizado com sucesso');
    }

    // 2. Verificar se as correções funcionaram
    console.log('\n2. 🔍 Verificando correções...');
    
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message_at,
        clients (name, phone)
      `)
      .not('last_message_at', 'is', null)
      .order('last_message_at', { ascending: false })
      .limit(5);

    if (convError) {
      console.error('❌ Erro ao verificar conversas:', convError.message);
    } else {
      console.log(`✅ ${conversations?.length || 0} conversas com last_message_at corrigido`);
      
      if (conversations && conversations.length > 0) {
        console.log('\n📋 Conversas corrigidas:');
        conversations.forEach((conv, index) => {
          const client = Array.isArray(conv.clients) ? conv.clients[0] : conv.clients;
          const clientName = client?.name || 'Cliente sem nome';
          console.log(`${index + 1}. ${clientName} - Última mensagem: ${conv.last_message_at}`);
        });
      }
    }

    // 3. Testar Realtime novamente
    console.log('\n3. 🔄 Testando Realtime após correções...');
    
    const channel = supabase
      .channel('test-messages-fixed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 Evento Realtime recebido após correção:', {
            event: payload.eventType,
            table: payload.table,
            messageId: payload.new?.id
          });
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status do Realtime: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime funcionando após correções!');
          
          setTimeout(() => {
            console.log('\n✅ Correções aplicadas com sucesso!');
            console.log('💡 Agora teste o frontend novamente');
            supabase.removeChannel(channel);
            process.exit(0);
          }, 5000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime ainda com erro após correções');
          process.exit(1);
        }
      });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar correções
applyFixes();