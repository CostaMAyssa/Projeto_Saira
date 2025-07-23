// Script para testar o fluxo completo de venda

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para testar o fluxo completo de venda
 */
async function testarFluxoCompleto() {
  try {
    // 1. Verificar estoque inicial do produto
    const productId = '5944776f-6e9d-4c89-bb43-93e185bc11ff'; // Dipirona 500mg
    const clientId = '2db4fe30-3b6e-467f-80fe-919888e77b97'; // Mayssa Ferreira
    const userId = 'fe39cc23-b68b-4526-a514-c92b877cac0c'; // ID do usuário logado
    
    console.log('=== TESTE DE FLUXO COMPLETO DE VENDA ===');
    console.log(`Produto ID: ${productId}`);
    console.log(`Cliente ID: ${clientId}`);
    
    // Verificar estoque inicial
    const { data: initialProduct, error: initialError } = await supabase
      .from('products')
      .select('name, stock')
      .eq('id', productId)
      .single();
    
    if (initialError) {
      console.error('Erro ao buscar produto:', initialError);
      return;
    }
    
    console.log(`\nEstoque inicial de ${initialProduct.name}: ${initialProduct.stock} unidades`);
    
    // 2. Verificar histórico de compras inicial do cliente
    console.log('\nHistórico de compras inicial:');
    const { data: initialSales, error: initialSalesError } = await supabase
      .from('sales')
      .select(`
        id, 
        created_at,
        sale_items (id, quantity, unit_price, product_id, products:product_id (name))
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (initialSalesError) {
      console.error('Erro ao buscar histórico inicial:', initialSalesError);
      return;
    }
    
    console.log(`Total de compras: ${initialSales.length}`);
    
    // 3. Registrar uma nova venda via Edge Function
    console.log('\nRegistrando nova venda via Edge Function...');
    
    // Preparar os dados para a chamada da Edge Function
    const payload = {
      client_id: clientId,
      user_id: userId,
      itens: [{
        product_id: productId,
        quantity: 1
      }]
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
    
    // 4. Verificar estoque após a venda
    const { data: updatedProduct, error: updatedError } = await supabase
      .from('products')
      .select('name, stock')
      .eq('id', productId)
      .single();
    
    if (updatedError) {
      console.error('Erro ao buscar produto atualizado:', updatedError);
      return;
    }
    
    console.log(`\nEstoque após venda de ${updatedProduct.name}: ${updatedProduct.stock} unidades`);
    console.log(`Diferença de estoque: ${initialProduct.stock - updatedProduct.stock} unidades`);
    
    // 5. Verificar histórico de compras atualizado
    console.log('\nHistórico de compras atualizado:');
    const { data: updatedSales, error: updatedSalesError } = await supabase
      .from('sales')
      .select(`
        id, 
        created_at,
        sale_items (id, quantity, unit_price, product_id, products:product_id (name))
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (updatedSalesError) {
      console.error('Erro ao buscar histórico atualizado:', updatedSalesError);
      return;
    }
    
    console.log(`Total de compras: ${updatedSales.length}`);
    console.log(`Novas compras: ${updatedSales.length - initialSales.length}`);
    
    // Exibir a compra mais recente
    if (updatedSales.length > 0) {
      const latestSale = updatedSales[0];
      console.log(`\nCompra mais recente (ID: ${latestSale.id}):`);
      console.log(`Data: ${new Date(latestSale.created_at).toLocaleString()}`);
      console.log('Produtos:');
      
      latestSale.sale_items.forEach(item => {
        const productName = item.products ? item.products.name : 'Produto não encontrado';
        console.log(`  - ${productName}, Quantidade: ${item.quantity}`);
      });
    }
    
    // 6. Verificar associação cliente-produto
    console.log('\nVerificando associação cliente-produto:');
    const { data: association, error: associationError } = await supabase
      .from('client_product_associations')
      .select('*')
      .eq('client_id', clientId)
      .eq('product_id', productId)
      .single();
    
    if (associationError) {
      console.error('Erro ao buscar associação:', associationError);
      return;
    }
    
    console.log('Associação encontrada:');
    console.log(`  Cliente ID: ${association.client_id}`);
    console.log(`  Produto ID: ${association.product_id}`);
    console.log(`  Última compra: ${new Date(association.last_purchase).toLocaleString()}`);
    
    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o teste
testarFluxoCompleto();