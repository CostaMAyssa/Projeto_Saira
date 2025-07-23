// Solução para o problema de atualização de estoque na venda de produtos
// Identificamos que o problema estava no ID do produto que estava sendo usado incorretamente

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para registrar uma venda de produto
 * @param {string} clientId - ID do cliente
 * @param {string} userId - ID do usuário que está registrando a venda
 * @param {Array} items - Array de objetos com productId e quantity
 * @returns {Object} - Resultado da operação
 */
async function registrarVenda(clientId, userId, items) {
  // Validar parâmetros
  if (!clientId || !userId || !items || !items.length) {
    throw new Error('Parâmetros inválidos para registrar venda');
  }

  try {
    // 1. Verificar se os produtos existem e têm estoque suficiente
    const produtosVerificados = [];
    let total = 0;

    for (const item of items) {
      const { productId, quantity } = item;
      
      // Buscar produto no banco
      const { data: produto, error: produtoError } = await supabase
        .from('products')
        .select('id, name, stock')
        .eq('id', productId)
        .single();

      if (produtoError || !produto) {
        throw new Error(`Produto com ID ${productId} não encontrado`);
      }

      if (produto.stock < quantity) {
        throw new Error(`Estoque insuficiente para o produto ${produto.name}. Disponível: ${produto.stock}`);
      }

      produtosVerificados.push({
        ...produto,
        quantity,
      });
    }

    // 2. Criar a venda
    const { data: venda, error: vendaError } = await supabase
      .from('sales')
      .insert({
        client_id: clientId,
        created_by: userId,
        total: total, // Opcional, pode ser calculado depois
      })
      .select()
      .single();

    if (vendaError) {
      throw new Error(`Erro ao criar venda: ${vendaError.message}`);
    }

    // 3. Registrar os itens da venda
    const itensVenda = items.map(item => ({
      sale_id: venda.id,
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const { error: itensError } = await supabase
      .from('sale_items')
      .insert(itensVenda);

    if (itensError) {
      throw new Error(`Erro ao registrar itens da venda: ${itensError.message}`);
    }

    // 4. Atualizar o estoque dos produtos
    for (const item of items) {
      const { productId, quantity } = item;
      
      // IMPORTANTE: Buscar o estoque atual antes de atualizar
      const { data: produtoAtual } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();
      
      // Calcular novo estoque
      const novoEstoque = produtoAtual.stock - quantity;
      
      // Atualizar estoque
      const { error: estoqueError } = await supabase
        .from('products')
        .update({ stock: novoEstoque })
        .eq('id', productId);

      if (estoqueError) {
        throw new Error(`Erro ao atualizar estoque do produto ${productId}: ${estoqueError.message}`);
      }
    }

    // 5. Atualizar associação cliente-produto (última compra)
    for (const item of items) {
      const { productId } = item;
      
      // Verificar se já existe associação
      const { data: associacaoExistente } = await supabase
        .from('client_product_associations')
        .select('id')
        .eq('client_id', clientId)
        .eq('product_id', productId);

      if (associacaoExistente && associacaoExistente.length > 0) {
        // Atualizar associação existente
        await supabase
          .from('client_product_associations')
          .update({ last_purchase: new Date().toISOString() })
          .eq('client_id', clientId)
          .eq('product_id', productId);
      } else {
        // Criar nova associação
        await supabase
          .from('client_product_associations')
          .insert({
            client_id: clientId,
            product_id: productId,
            last_purchase: new Date().toISOString(),
          });
      }
    }

    return {
      success: true,
      venda,
      message: 'Venda registrada com sucesso!',
    };
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Exemplo de uso da função
async function testarRegistroVenda() {
  // IDs de exemplo (substitua pelos IDs reais do seu banco)
  const clientId = '674d128a-510d-4b86-aff0-45e44e0bf242'; // ID do cliente
  const userId = 'fe39cc23-b68b-4526-a514-c92b877cac0c'; // ID do usuário logado
  
  // Produtos para vender (com o ID CORRETO do produto)
  const items = [
    {
      productId: '5944776f-6e9d-4c89-bb43-93e185bc11ff', // ID correto da Dipirona 500mg
      quantity: 2,
    },
  ];

  const resultado = await registrarVenda(clientId, userId, items);
  console.log('Resultado do teste:', resultado);
}

// Executar o teste
testarRegistroVenda();