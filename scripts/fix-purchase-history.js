// Script para corrigir a integração entre o frontend e a função de registro de vendas no Supabase

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, anonKey);

/**
 * Função para registrar uma venda de produto através da Edge Function
 * @param {string} clientId - ID do cliente
 * @param {string} userId - ID do usuário que está registrando a venda
 * @param {Array} items - Array de objetos com product_id e quantity
 * @returns {Object} - Resultado da operação
 */
async function registrarVendaViaEdgeFunction(clientId, userId, items) {
  try {
    // Preparar os dados para a chamada da Edge Function
    const payload = {
      client_id: clientId,
      user_id: userId,
      itens: items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity
      }))
    };

    console.log('Enviando dados para a Edge Function:', payload);

    // Chamar a Edge Function register-sale
    const { data, error } = await supabase.functions.invoke('register-sale', {
      body: JSON.stringify(payload)
    });

    if (error) {
      console.error('Erro ao chamar a Edge Function:', error);
      return { success: false, error: error.message };
    }

    console.log('Resposta da Edge Function:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao registrar venda via Edge Function:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Função para modificar o componente PurchaseHistory para integrar com a Edge Function
 */
function modificarComponentePurchaseHistory() {
  console.log('Para corrigir o problema de integração entre o frontend e a função de registro de vendas, siga estas instruções:');
  console.log('\n1. Modifique o método handleRegisterSale no componente PurchaseHistory.tsx:');
  console.log(`
const handleRegisterSale = async () => {
  try {
    // Obter o ID do cliente da conversa ativa
    const { data: conversation } = await supabase
      .from('conversations')
      .select('client_id')
      .eq('id', activeConversationId)
      .single();

    if (!conversation?.client_id) {
      toast.error('Não foi possível identificar o cliente para esta venda.');
      return;
    }

    // Obter o ID do usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Usuário não autenticado.');
      return;
    }

    // Preparar os itens para a venda
    const itens = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    // Chamar a Edge Function para registrar a venda
    const { data, error } = await supabase.functions.invoke('register-sale', {
      body: JSON.stringify({
        client_id: conversation.client_id,
        user_id: user.id,
        itens
      })
    });

    if (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error('Erro ao registrar venda: ' + error.message);
      return;
    }

    console.log('Venda registrada com sucesso:', data);
    toast.success('Venda registrada com sucesso!');
    setIsSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSuccess(false);
      setCart([]);
      // Recarregar o histórico de compras
      fetchPurchaseHistory(conversation.client_id);
    }, 1500);
  } catch (error) {
    console.error('Erro ao processar venda:', error);
    toast.error('Erro ao processar venda: ' + error.message);
  }
};
`);

  console.log('\n2. Adicione uma função para buscar o histórico de compras real do cliente:');
  console.log(`
const fetchPurchaseHistory = async (clientId) => {
  try {
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

    // Para cada venda, buscar os itens
    const purchaseHistory = [];
    for (const sale of sales) {
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', sale.id);

      if (itemsError) {
        console.error('Erro ao buscar itens da venda:', itemsError);
        continue;
      }

      // Buscar os nomes dos produtos
      const productIds = items.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      if (productsError) {
        console.error('Erro ao buscar produtos:', productsError);
        continue;
      }

      // Mapear os itens com os nomes dos produtos
      const purchaseItems = items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          name: product ? product.name : 'Produto não encontrado',
          quantity: item.quantity
        };
      });

      purchaseHistory.push({
        id: sale.id,
        date: new Date(sale.created_at).toISOString().split('T')[0], // Formato YYYY-MM-DD
        items: purchaseItems
      });
    }

    // Atualizar o estado com o histórico real
    setPurchases(purchaseHistory);
  } catch (error) {
    console.error('Erro ao buscar histórico de compras:', error);
  }
};
`);

  console.log('\n3. Modifique o useEffect para buscar o histórico real quando a conversa ativa mudar:');
  console.log(`
useEffect(() => {
  if (activeConversationId) {
    // Buscar o ID do cliente da conversa ativa
    supabase
      .from('conversations')
      .select('client_id')
      .eq('id', activeConversationId)
      .single()
      .then(({ data, error }) => {
        if (error || !data?.client_id) {
          console.error('Erro ao buscar cliente da conversa:', error);
          return;
        }
        // Buscar o histórico de compras do cliente
        fetchPurchaseHistory(data.client_id);
      });
  }
}, [activeConversationId]);
`);

  console.log('\n4. Substitua o uso de mockPurchases por purchases (estado real):');
  console.log(`
// Adicione este estado
const [purchases, setPurchases] = useState<Purchase[]>([]);

// E substitua mockPurchases por purchases no JSX
{purchases.length === 0 && (
  <div className="text-sm text-pharmacy-text2 mb-2">Nenhuma compra registrada.</div>
)}
{purchases.map((purchase) => (
  // ... resto do código
))}
`);
}

// Executar a função de orientação
modificarComponentePurchaseHistory();