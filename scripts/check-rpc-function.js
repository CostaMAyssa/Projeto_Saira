// Script para verificar a função RPC decrement_product_stock

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para verificar a existência da função RPC e testar a atualização de estoque
 */
async function verificarFuncaoRPC() {
  try {
    // Verificar o estoque atual de um produto
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
    
    // Tentar chamar a função RPC
    console.log('Tentando chamar a função RPC decrement_product_stock...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('decrement_product_stock', {
      product_id: productId,
      quantidade: 1
    });
    
    if (rpcError) {
      console.error('Erro ao chamar a função RPC:', rpcError);
      console.log('A função RPC decrement_product_stock provavelmente não existe.');
      
      // Testar o método alternativo (update direto)
      console.log('Testando o método alternativo (update direto)...');
      const { data: updateResult, error: updateError } = await supabase
        .from('products')
        .update({ stock: produtoAntes.stock - 1 })
        .eq('id', productId);
      
      if (updateError) {
        console.error('Erro ao atualizar estoque diretamente:', updateError);
        return;
      }
      
      console.log('Estoque atualizado diretamente com sucesso!');
    } else {
      console.log('Função RPC executada com sucesso:', rpcResult);
    }
    
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

// Executar a verificação
verificarFuncaoRPC();