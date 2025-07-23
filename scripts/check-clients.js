// Script para verificar os clientes disponíveis no banco de dados

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para verificar os clientes disponíveis
 */
async function verificarClientes() {
  try {
    // Buscar todos os clientes
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, phone')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return;
    }
    
    console.log('=== CLIENTES DISPONÍVEIS ===');
    clients.forEach(client => {
      console.log(`${client.name}: ${client.phone || 'Sem telefone'} (ID: ${client.id})`);
    });
    console.log('=========================');
    
    // Verificar as conversas ativas
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, client_id')
      .order('created_at', { ascending: false });
    
    if (convError) {
      console.error('Erro ao buscar conversas:', convError);
      return;
    }
    
    console.log('\n=== CONVERSAS ATIVAS ===');
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
verificarClientes();