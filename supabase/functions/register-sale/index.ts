// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  try {
    const { client_id, user_id, itens, total } = await req.json();
    if (!client_id || !user_id || !Array.isArray(itens) || itens.length === 0) {
      return new Response(JSON.stringify({ error: 'Dados obrigatórios faltando' }), { status: 400 });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const sale_id = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Inserir venda
    const { error: saleError } = await supabase.from('sales').insert({
      id: sale_id,
      client_id,
      created_by: user_id,
      created_at: now,
      total: total || null
    });
    if (saleError) {
      return new Response(JSON.stringify({ error: 'Erro ao registrar venda', details: saleError.message }), { status: 500 });
    }

    // 2. Para cada item: inserir em sale_items, atualizar estoque, atualizar relacionamento
    for (const item of itens) {
      const { product_id, quantity, unit_price } = item;
      if (!product_id || !quantity || quantity <= 0) {
        return new Response(JSON.stringify({ error: 'Dados de item inválidos', item }), { status: 400 });
      }
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
        return new Response(JSON.stringify({ error: 'Erro ao registrar item da venda', details: itemError.message, item }), { status: 500 });
      }
      // 2.2 Atualizar estoque
      const { error: stockError } = await supabase.rpc('decrement_product_stock', {
        product_id,
        quantidade: quantity
      });
      if (stockError) {
        // fallback: update direto
        await supabase.from('products').update({ stock: supabase.raw('stock - ?', [quantity]) }).eq('id', product_id);
      }
      // 2.3 Upsert relacionamento cliente-produto
      await supabase.from('client_product_associations').upsert({
        id: crypto.randomUUID(),
        client_id,
        product_id,
        last_purchase: now
      }, { onConflict: ['client_id', 'product_id'] });
    }
    return new Response(JSON.stringify({ success: true, sale_id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro interno', details: err.message }), { status: 500 });
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
