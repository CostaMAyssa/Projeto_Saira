import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Interface para os dados de compra

interface Purchase {
  id: string;
  date: string;
  items: { name: string; quantity: number }[];
}

// Estado para armazenar as compras reais do cliente

interface CartItem {
  id: string;
  name: string;
  stock: number;
  quantity: number;
  category: string;
  tags: string[];
  needsPrescription: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  interval?: number;
  tags: string[];
  needsPrescription: boolean;
  controlled?: boolean;
}

interface PurchaseHistoryProps {
  activeConversationId?: string;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ activeConversationId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar produtos reais do banco ao abrir o modal
  useEffect(() => {
    if (isModalOpen) {
      setLoadingProducts(true);
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const transformed = data.map((dbProduct: any) => ({
              id: dbProduct.id,
              name: dbProduct.name,
              category: dbProduct.category || '',
              stock: dbProduct.stock || 0,
              interval: dbProduct.interval,
              tags: dbProduct.tags || [],
              needsPrescription: dbProduct.needs_prescription || false,
              controlled: dbProduct.controlled || false,
            }));
            setProducts(transformed);
            setFilteredProducts(transformed);
          }
          setLoadingProducts(false);
        });
    }
  }, [isModalOpen]);
  
  // Buscar histórico de compras do cliente quando a conversa ativa mudar
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
  
  // Função para buscar o histórico de compras do cliente
  const fetchPurchaseHistory = async (clientId: string) => {
    try {
      setIsLoading(true);
      // Buscar as vendas do cliente
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (salesError) {
        console.error('Erro ao buscar vendas:', salesError);
        setIsLoading(false);
        return;
      }

      if (!sales || sales.length === 0) {
        setPurchases([]);
        setIsLoading(false);
        return;
      }

      // Para cada venda, buscar os itens
      const purchaseHistory: Purchase[] = [];
      for (const sale of sales) {
        const { data: items, error: itemsError } = await supabase
          .from('sale_items')
          .select('product_id, quantity')
          .eq('sale_id', sale.id);

        if (itemsError) {
          console.error('Erro ao buscar itens da venda:', itemsError);
          continue;
        }

        if (!items || items.length === 0) continue;

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
          const product = products?.find(p => p.id === item.product_id);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Filtro de busca
  useEffect(() => {
    setFilteredProducts(
      products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (cart.some(item => item.id === selectedProduct.id)) return;
    setCart([
      ...cart,
      {
        id: selectedProduct.id,
        name: selectedProduct.name,
        stock: selectedProduct.stock,
        quantity,
        category: selectedProduct.category,
        tags: selectedProduct.tags,
        needsPrescription: selectedProduct.needsPrescription,
      },
    ]);
    setSelectedProduct(null);
    setQuantity(1);
    setSearch('');
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleRegisterSale = async () => {
    try {
      if (!activeConversationId) {
        toast.error('Não foi possível identificar a conversa ativa.');
        return;
      }
      
      // Obter o ID do cliente da conversa ativa
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('client_id')
        .eq('id', activeConversationId)
        .single();

      if (convError || !conversation?.client_id) {
        console.error('Erro ao buscar cliente da conversa:', convError);
        toast.error('Não foi possível identificar o cliente para esta venda.');
        return;
      }

      // Obter o ID do usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Erro ao obter usuário:', userError);
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
          itens,
          conversation_id: activeConversationId // Enviar o ID da conversa para exibir a mensagem no chat
        })
      });

      if (error) {
        console.error('Erro ao registrar venda:', error);
        toast.error(`Erro ao registrar venda: ${error.message}`);
        return;
      }

      console.log('Venda registrada com sucesso:', data);
      toast.success('Venda registrada com sucesso!');
      setIsSuccess(true);
      
      // Atualizar o histórico de compras após o registro da venda
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
        setCart([]);
        // Recarregar o histórico de compras
        if (conversation.client_id) {
          fetchPurchaseHistory(conversation.client_id);
        }
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao processar venda:', error);
      toast.error(`Erro ao processar venda: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <h3 className="font-medium text-pharmacy-text1">Histórico de Compras</h3>
      </div>
      {isLoading ? (
        <div className="text-sm text-pharmacy-text2 mb-2">Carregando histórico de compras...</div>
      ) : purchases.length === 0 ? (
        <div className="text-sm text-pharmacy-text2 mb-2">Nenhuma compra registrada.</div>
      ) : null}
      {!isLoading && purchases.map((purchase) => (
        <div key={purchase.id} className="mb-3 p-2 bg-pharmacy-light2 rounded-xl">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-pharmacy-text2">{purchase.date}</span>
          </div>
          <ul className="text-sm text-pharmacy-text1 pl-4 list-disc">
            {purchase.items.map((item, idx) => (
              <li key={idx}>{item.name} <span className="text-xs text-pharmacy-text2">x{item.quantity}</span></li>
            ))}
          </ul>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-pharmacy-whatsapp-primary border-pharmacy-border1 hover:bg-pharmacy-whatsapp-primary hover:text-white mt-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Package className="h-4 w-4 mr-2" />
        Vender Produto
      </Button>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white p-6 rounded-xl shadow-xl min-w-[340px] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-semibold mb-2">Venda de Produto</DialogTitle>
          </DialogHeader>
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="text-2xl text-green-600 mb-2">✔️</span>
              <p className="text-pharmacy-text1 font-medium">Venda registrada com sucesso!</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Input
                  placeholder="Buscar produto por nome ou categoria..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-32 overflow-y-auto border rounded-md bg-gray-50">
                  {loadingProducts ? (
                    <div className="text-xs text-gray-400 p-2">Carregando produtos...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-xs text-gray-400 p-2">Nenhum produto encontrado.</div>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-pharmacy-light2 ${selectedProduct?.id === product.id ? 'bg-pharmacy-light2' : ''}`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div>
                          <span className="font-medium text-pharmacy-text1 text-sm">{product.name}</span>
                          <Badge className="ml-2 bg-gray-200 text-gray-700">{product.category}</Badge>
                          {product.tags.map((tag: string) => (
                            <Badge key={tag} className="ml-1 bg-pharmacy-green1 text-white">{tag}</Badge>
                          ))}
                          {product.needsPrescription && (
                            <Badge className="ml-1 bg-pharmacy-accent text-white">Com Receita</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">Estoque: {product.stock}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {selectedProduct && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm font-medium text-pharmacy-text1">{selectedProduct.name}</span>
                  <Input
                    type="number"
                    min={1}
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Math.min(selectedProduct.stock, Number(e.target.value))))}
                    className="w-20"
                  />
                  <Button size="sm" onClick={handleAddToCart} disabled={cart.some(item => item.id === selectedProduct.id)}>
                    <Plus className="h-4 w-4 mr-1" />Adicionar
                  </Button>
                </div>
              )}
              {cart.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-pharmacy-text1 mb-2 text-sm">Carrinho</h4>
                  <ul>
                    {cart.map(item => (
                      <li key={item.id} className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-medium text-pharmacy-text1 text-sm">{item.name}</span>
                          <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full">Fechar</Button>
                <Button
                  onClick={handleRegisterSale}
                  className="w-full bg-pharmacy-whatsapp-primary text-white hover:bg-pharmacy-whatsapp-primary/90"
                  disabled={cart.length === 0}
                >
                  Registrar Venda
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;