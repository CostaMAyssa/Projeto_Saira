// Script para testar a atualização direta do estoque de um produto

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para testar a atualização direta do estoque
 */
async function testarAtualizacaoEstoque() {
  try {
    const productId = '5944776f-6e9d-4c89-bb43-93e185bc11ff'; // ID da Dipirona 500mg
    
    // Buscar estoque atual
    const { data: produtoAntes, error: errorAntes } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .single();
    
    if (errorAntes) {
      console.error('Erro ao buscar produto:', errorAntes);
      return;
    }
    
    console.log('Estoque atual do produto:', produtoAntes);
    
    // Atualizar estoque diretamente
    console.log('Atualizando estoque diretamente...');
    const novoEstoque = produtoAntes.stock - 1;
    const { data: updateResult, error: updateError } = await supabase
      .from('products')
      .update({ stock: novoEstoque })
      .eq('id', productId);
    
    if (updateError) {
      console.error('Erro ao atualizar estoque diretamente:', updateError);
      return;
    }
    
    console.log('Estoque atualizado diretamente com sucesso!');
    
    // Verificar o estoque após a atualização
    const { data: produtoDepois, error: errorDepois } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .single();
    
    if (errorDepois) {
      console.error('Erro ao buscar produto após atualização:', errorDepois);
      return;
    }
    
    console.log('Estoque do produto após atualização:', produtoDepois);
    console.log(`Diferença de estoque: ${produtoAntes.stock - produtoDepois.stock}`);
    
    // Restaurar o estoque original
    const { error: restoreError } = await supabase
      .from('products')
      .update({ stock: produtoAntes.stock })
      .eq('id', productId);
    
    if (restoreError) {
      console.error('Erro ao restaurar estoque original:', restoreError);
      return;
    }
    
    console.log('Estoque restaurado ao valor original:', produtoAntes.stock);
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o teste
testarAtualizacaoEstoque();