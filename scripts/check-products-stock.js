// Script para verificar o estoque dos produtos

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para verificar o estoque dos produtos
 */
async function verificarEstoqueProdutos() {
  try {
    // Buscar todos os produtos
    const { data: produtos, error } = await supabase
      .from('products')
      .select('id, name, stock')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return;
    }
    
    console.log('=== ESTOQUE DE PRODUTOS ===');
    produtos.forEach(produto => {
      console.log(`${produto.name}: ${produto.stock} unidades (ID: ${produto.id})`);
    });
    console.log('=========================');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a verificação
verificarEstoqueProdutos();