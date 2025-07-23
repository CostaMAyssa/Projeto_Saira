// Script para testar a funcionalidade de histórico de compras

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para testar a obtenção do histórico de compras de um cliente
 */
async function testarHistoricoCompras() {
  try {
    // ID do cliente para teste (Mayssa Ferreira)
    const clientId = '2db4fe30-3b6e-467f-80fe-919888e77b97';
    
    console.log(`Buscando histórico de compras para o cliente ID: ${clientId}`);
    
    // Buscar o cliente para confirmar
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('name, phone')
      .eq('id', clientId)
      .single();
    
    if (clientError) {
      console.error('Erro ao buscar cliente:', clientError);
      return;
    }
    
    console.log(`Cliente: ${client.name} (${client.phone})`);
    
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
    
    console.log(`Total de vendas encontradas: ${sales.length}`);
    
    // Para cada venda, buscar os itens
    for (const sale of sales) {
      console.log(`\nVenda ID: ${sale.id}`);
      console.log(`Data: ${new Date(sale.created_at).toLocaleString()}`);
      
      // Buscar os itens da venda
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select('id, product_id, quantity, unit_price')
        .eq('sale_id', sale.id);
      
      if (itemsError) {
        console.error('Erro ao buscar itens da venda:', itemsError);
        continue;
      }
      
      console.log(`Itens: ${items.length}`);
      
      // Para cada item, buscar o produto
      for (const item of items) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('name')
          .eq('id', item.product_id)
          .single();
        
        if (productError) {
          console.log(`  - Produto não encontrado (ID: ${item.product_id}), Quantidade: ${item.quantity}`);
        } else {
          console.log(`  - ${product.name} (ID: ${item.product_id}), Quantidade: ${item.quantity}`);
        }
      }
    }
    
    // Testar a consulta que o componente PurchaseHistory provavelmente usa
    console.log('\n=== SIMULANDO CONSULTA DO COMPONENTE PURCHASEHISTORY ===');
    
    // Esta é uma consulta mais complexa que junta vendas, itens e produtos
    const { data: purchaseHistory, error: historyError } = await supabase
      .from('sales')
      .select(`
        id, 
        created_at,
        sale_items (id, quantity, unit_price, product_id, products:product_id (name))
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (historyError) {
      console.error('Erro ao buscar histórico de compras:', historyError);
      return;
    }
    
    console.log(`Histórico de compras obtido com sucesso. Total de vendas: ${purchaseHistory.length}`);
    
    // Exibir o histórico formatado
    purchaseHistory.forEach(sale => {
      console.log(`\nCompra em: ${new Date(sale.created_at).toLocaleString()}`);
      console.log('Produtos:');
      
      sale.sale_items.forEach(item => {
        const productName = item.products ? item.products.name : 'Produto não encontrado';
        console.log(`  - ${productName}, Quantidade: ${item.quantity}`);
      });
    });
    
    console.log('\n=========================');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o teste
testarHistoricoCompras();