// Script para verificar as conversas ativas no banco de dados

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para verificar as conversas ativas
 */
async function verificarConversas() {
  try {
    // Primeiro, verificar a estrutura da tabela de conversas
    console.log('=== ESTRUTURA DA TABELA DE CONVERSAS ===');
    const { data: columns, error: columnsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error('Erro ao buscar estrutura da tabela:', columnsError);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('Colunas disponíveis:', Object.keys(columns[0]));
    } else {
      console.log('Nenhuma conversa encontrada para verificar a estrutura.');
    }
    
    // Buscar todas as conversas
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, client_id')
      .limit(10);
    
    if (convError) {
      console.error('Erro ao buscar conversas:', convError);
      return;
    }
    
    console.log('\n=== CONVERSAS ATIVAS ===');
    console.log(`Total de conversas encontradas: ${conversations.length}`);
    
    for (const conv of conversations) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('name')
        .eq('id', conv.client_id)
        .single();
      
      if (clientError) {
        console.log(`Conversa ${conv.id}: Cliente não encontrado (ID: ${conv.client_id})`);
      } else {
        console.log(`Conversa ${conv.id}: ${client.name} (ID: ${conv.client_id})`);
      }
    }
    console.log('=========================');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a verificação
verificarConversas();