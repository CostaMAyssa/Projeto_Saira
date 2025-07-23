// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Declare Deno namespace to fix TypeScript errors
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @deno-types="npm:@supabase/supabase-js@2"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  // Configuração de CORS para permitir requisições do frontend
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    console.log('Recebendo requisição para register-sale');
    const body = await req.json();
    console.log('Corpo da requisição:', JSON.stringify(body));
    const { client_id, user_id, itens, total, conversation_id } = body;
    if (!client_id || !user_id || !Array.isArray(itens) || itens.length === 0) {
      return new Response(JSON.stringify({ error: 'Dados obrigatórios faltando' }), { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const sale_id = crypto.randomUUID();
    const now = new Date().toISOString();

    console.log('Inserindo venda com dados:', { client_id, user_id, itens_count: itens.length });
    
    // 1. Inserir venda
    const { error: saleError } = await supabase.from('sales').insert({
      id: sale_id,
      client_id,
      created_by: user_id,
      created_at: now,
      total: total || null
    });
    if (saleError) {
      console.error('Erro ao inserir venda:', saleError.message);
      return new Response(JSON.stringify({ error: 'Erro ao registrar venda', details: saleError.message }), { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('Venda inserida com sucesso, ID:', sale_id);

    // 2. Para cada item: inserir em sale_items, atualizar estoque, atualizar relacionamento
    console.log('Processando itens da venda...');
    for (const item of itens) {
      const { product_id, quantity, unit_price } = item;
      if (!product_id || !quantity || quantity <= 0) {
        console.error('Dados de item inválidos:', item);
        return new Response(JSON.stringify({ error: 'Dados de item inválidos', item }), { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log(`Processando item: ${product_id}, quantidade: ${quantity}`);
      // 2.1 Inserir em sale_items
      const { error: itemError } = await supabase.from('sale_items').insert({
        id: crypto.randomUUID(),
        sale_id,
        product_id,
        quantity,
        unit_price: unit_price || null,
        created_at: now
      });
      if (itemError) {
        console.error('Erro ao inserir item da venda:', itemError.message);
        return new Response(JSON.stringify({ error: 'Erro ao registrar item da venda', details: itemError.message, item }), { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log('Item inserido com sucesso');
      // 2.2 Atualizar estoque
      try {
        // Primeiro tenta usar a função RPC
        const { error: stockError } = await supabase.rpc('decrement_product_stock', {
          product_id,
          quantidade: quantity
        });
        
        if (stockError) {
          console.log('Erro ao usar RPC para atualizar estoque:', stockError.message);
          // Fallback: update direto
          const { data: produto, error: produtoError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', product_id)
            .single();
          
          if (produtoError) {
            throw new Error(`Erro ao buscar produto: ${produtoError.message}`);
          }
          
          if (produto.stock < quantity) {
            throw new Error(`Estoque insuficiente para o produto ${product_id}`);
          }
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: produto.stock - quantity })
            .eq('id', product_id);
          
          if (updateError) {
            throw new Error(`Erro ao atualizar estoque: ${updateError.message}`);
          }
          
          console.log(`Estoque atualizado diretamente: ${product_id}, novo estoque: ${produto.stock - quantity}`);
        } else {
          console.log(`Estoque atualizado via RPC: ${product_id}`);
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Erro ao atualizar estoque', details: error.message }), { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        });
      }
      // 2.3 Upsert relacionamento cliente-produto
      await supabase.from('client_product_associations').upsert({
        id: crypto.randomUUID(),
        client_id,
        product_id,
        last_purchase: now
      }, { onConflict: ['client_id', 'product_id'] });
    }
    // Preparar mensagem de confirmação da venda para o chat
    let saleMessage = "✅ *Venda registrada com sucesso!* \n\n";
    saleMessage += "📋 *Itens:* \n";
    
    // Buscar informações dos produtos vendidos para incluir na mensagem
    for (const item of itens) {
      const { data: produto } = await supabase
        .from('products')
        .select('name')
        .eq('id', item.product_id)
        .single();
      
      if (produto) {
        saleMessage += `- ${produto.name} (${item.quantity} unid.)\n`;
      }
    }
    
    // Inserir mensagem no chat se o ID da conversa foi fornecido
    if (conversation_id) {
      await supabase.from('messages').insert({
        conversation_id: conversation_id,
        content: saleMessage,
        sender: 'user',
        sent_at: now,
        message_type: 'text'
      });
      console.log('Mensagem de confirmação da venda inserida no chat');
    } else {
      console.log('ID da conversa não fornecido, mensagem de confirmação não será enviada');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sale_id,
      message: saleMessage 
    }), { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Erro interno na função register-sale:', err.message, err.stack);
    return new Response(JSON.stringify({ error: 'Erro interno', details: err.message }), { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/register-sale' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
