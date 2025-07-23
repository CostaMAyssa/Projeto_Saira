// Script para testar a função de registro de vendas no Supabase

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para testar a Edge Function register-sale
 */
async function testarEdgeFunction() {
  try {
    // Dados de teste
    const clientId = '2db4fe30-3b6e-467f-80fe-919888e77b97'; // ID do cliente (Mayssa Ferreira)
    const userId = 'fe39cc23-b68b-4526-a514-c92b877cac0c'; // ID do usuário logado
    
    // Produtos para vender (com o ID CORRETO do produto)
    const itens = [
      {
        product_id: '5944776f-6e9d-4c89-bb43-93e185bc11ff', // ID correto da Dipirona 500mg
        quantity: 1,
      },
    ];

    // Preparar payload para a Edge Function
    const payload = {
      client_id: clientId,
      user_id: userId,
      itens: itens
    };

    console.log('Enviando dados para a Edge Function:', payload);

    // Chamar a Edge Function register-sale
    const { data, error } = await supabase.functions.invoke('register-sale', {
      body: JSON.stringify(payload)
    });

    if (error) {
      console.error('Erro ao chamar a Edge Function:', error);
      return;
    }

    console.log('Resposta da Edge Function:', data);

    // Verificar se a venda foi registrada corretamente
    if (data && data.success && data.sale_id) {
      console.log('Venda registrada com sucesso! ID:', data.sale_id);

      // Verificar se o estoque foi atualizado
      const { data: produto, error: produtoError } = await supabase
        .from('products')
        .select('id, name, stock')
        .eq('id', itens[0].product_id)
        .single();

      if (produtoError) {
        console.error('Erro ao verificar estoque do produto:', produtoError);
        return;
      }

      console.log('Estoque atual do produto após a venda:', produto);

      // Verificar os itens da venda
      const { data: itensVenda, error: itensError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', data.sale_id);

      if (itensError) {
        console.error('Erro ao verificar itens da venda:', itensError);
        return;
      }

      console.log('Itens da venda:', itensVenda);

      // Verificar a associação cliente-produto
      const { data: associacao, error: associacaoError } = await supabase
        .from('client_product_associations')
        .select('*')
        .eq('client_id', clientId)
        .eq('product_id', itens[0].product_id);

      if (associacaoError) {
        console.error('Erro ao verificar associação cliente-produto:', associacaoError);
        return;
      }

      console.log('Associação cliente-produto:', associacao);
    }
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o teste
testarEdgeFunction();