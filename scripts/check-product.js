// Script para verificar o produto com ID específico
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase (as mesmas do arquivo .env.example)
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

async function checkProduct() {
  try {
    // 1. Identificamos o ID correto do produto Dipirona 500mg
    const correctId = '5944776f-6e9d-4c89-bb43-93e185bc11ff'; // Note o '11ff' no final, não '1fff'
    console.log(`\nVerificando produto com ID correto: ${correctId}`);
    
    // 2. Buscar o produto com o ID correto
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', correctId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar produto:', fetchError);
      return;
    }

    console.log('Produto encontrado:', product);
    console.log(`ID: ${product.id}, Nome: ${product.name}, Estoque atual: ${product.stock}`);

    // 3. Tentar atualizar o estoque com o ID correto
    console.log('\nTentando atualizar o estoque...');
    const novoEstoque = product.stock - 2;
    console.log(`Reduzindo estoque de ${product.stock} para ${novoEstoque}`);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('products')
      .update({ stock: novoEstoque })
      .eq('id', correctId)
      .select();

    if (updateError) {
      console.error('Erro ao atualizar estoque:', updateError);
      return;
    }

    console.log('Resultado da atualização:', updateResult);
    console.log(`Estoque atualizado com sucesso para: ${updateResult.stock}`);
    
    // 4. Demonstrar o problema com o ID incorreto
    const incorrectId = '5944776f-6e9d-4c89-bb43-93e185bc1fff'; // Note o '1fff' no final
    console.log(`\nTentando atualizar com ID incorreto: ${incorrectId}`);
    
    const { data: incorrectResult, error: incorrectError } = await supabase
      .from('products')
      .update({ stock: 999 }) // Valor fictício para demonstração
      .eq('id', incorrectId)
      .select();

    console.log('Resultado com ID incorreto:', incorrectResult);
    if (incorrectError) {
      console.error('Erro com ID incorreto:', incorrectError);
    } else {
      console.log('Nenhum erro, mas nenhuma linha foi atualizada porque o ID não existe.');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a função
checkProduct();