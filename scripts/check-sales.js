// Script para verificar as vendas registradas no banco de dados

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para verificar as vendas registradas
 */
async function verificarVendas() {
  try {
    // Buscar todas as vendas
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, client_id, created_at, created_by')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (salesError) {
      console.error('Erro ao buscar vendas:', salesError);
      return;
    }
    
    console.log('=== VENDAS REGISTRADAS ===');
    console.log(`Total de vendas encontradas: ${sales.length}`);
    
    for (const sale of sales) {
      console.log(`\nVenda ID: ${sale.id}`);
      console.log(`Data: ${new Date(sale.created_at).toLocaleString()}`);
      
      // Buscar o cliente
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('name')
        .eq('id', sale.client_id)
        .single();
      
      if (clientError) {
        console.log(`Cliente: Não encontrado (ID: ${sale.client_id})`);
      } else {
        console.log(`Cliente: ${client.name} (ID: ${sale.client_id})`);
      }
      
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
    
    console.log('\n=========================');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a verificação
verificarVendas();