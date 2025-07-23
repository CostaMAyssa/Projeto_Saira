// Script para testar a integração entre o frontend e o backend

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para testar a integração entre o frontend e o backend
 */
async function testarIntegracao() {
  try {
    // 1. Verificar o estoque inicial
    const productId = '5944776f-6e9d-4c89-bb43-93e185bc11ff'; // ID da Dipirona 500mg
    const { data: produtoAntes, error: errorAntes } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .single();
    
    if (errorAntes) {
      console.error('Erro ao buscar produto:', errorAntes);
      return;
    }
    
    console.log('Estoque inicial do produto:', produtoAntes);
    
    // 2. Simular a atualização direta do estoque (como faria o frontend)
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
    
    // 3. Verificar o estoque após a atualização
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
    
    // 4. Simular o registro de uma venda (como faria o componente PurchaseHistory)
    console.log('\nSimulando o registro de uma venda...');
    
    // Dados da venda
    const clientId = '2db4fe30-3b6e-467f-80fe-919888e77b97'; // ID do cliente (Mayssa Ferreira)
    const userId = 'fe39cc23-b68b-4526-a514-c92b877cac0c'; // ID do usuário logado
    
    // Criar a venda diretamente na tabela sales
    const saleId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const { error: saleError } = await supabase.from('sales').insert({
      id: saleId,
      client_id: clientId,
      created_by: userId,
      created_at: now
    });
    
    if (saleError) {
      console.error('Erro ao inserir venda:', saleError);
      return;
    }
    
    console.log('Venda inserida com sucesso, ID:', saleId);
    
    // Inserir o item da venda
    const { error: itemError } = await supabase.from('sale_items').insert({
      id: crypto.randomUUID(),
      sale_id: saleId,
      product_id: productId,
      quantity: 1,
      created_at: now
    });
    
    if (itemError) {
      console.error('Erro ao inserir item da venda:', itemError);
      return;
    }
    
    console.log('Item da venda inserido com sucesso');
    
    // Atualizar a associação cliente-produto
    const { error: assocError } = await supabase.from('client_product_associations').upsert({
      id: crypto.randomUUID(),
      client_id: clientId,
      product_id: productId,
      last_purchase: now
    }, { onConflict: ['client_id', 'product_id'] });
    
    if (assocError) {
      console.error('Erro ao atualizar associação cliente-produto:', assocError);
      return;
    }
    
    console.log('Associação cliente-produto atualizada com sucesso');
    
    // 5. Verificar o histórico de compras do cliente
    console.log('\nVerificando o histórico de compras do cliente...');
    
    // Buscar as vendas do cliente
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (salesError) {
      console.error('Erro ao buscar vendas:', salesError);
      return;
    }
    
    console.log(`Encontradas ${sales.length} vendas para o cliente`);
    
    // Para a última venda, buscar os itens
    if (sales.length > 0) {
      const lastSale = sales[0];
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', lastSale.id);
      
      if (itemsError) {
        console.error('Erro ao buscar itens da venda:', itemsError);
        return;
      }
      
      console.log(`Encontrados ${items.length} itens na última venda:`);
      
      // Buscar os nomes dos produtos
      const productIds = items.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      
      if (productsError) {
        console.error('Erro ao buscar produtos:', productsError);
        return;
      }
      
      // Mapear os itens com os nomes dos produtos
      const purchaseItems = items.map(item => {
        const product = products?.find(p => p.id === item.product_id);
        return {
          name: product ? product.name : 'Produto não encontrado',
          quantity: item.quantity
        };
      });
      
      console.log('Itens da última venda:', purchaseItems);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o teste
testarIntegracao();