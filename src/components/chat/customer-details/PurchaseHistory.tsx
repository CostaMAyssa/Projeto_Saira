import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

// Mock de produtos disponíveis (depois buscar do backend)
const mockProducts = [
  { id: '1', name: 'Losartana 50mg', category: 'Anti-hipertensivo', stock: 10, tags: ['Uso Contínuo'], needsPrescription: false },
  { id: '2', name: 'Aspirina 100mg', category: 'Analgésico', stock: 20, tags: ['Uso Comum'], needsPrescription: false },
  { id: '3', name: 'Insulina Lantus', category: 'Hormônio', stock: 5, tags: ['Controlado'], needsPrescription: true },
];

interface Purchase {
  id: string;
  date: string;
  items: { name: string; quantity: number }[];
}

const mockPurchases: Purchase[] = [
  {
    id: '1',
    date: '2024-07-25',
    items: [
      { name: 'Losartana 50mg', quantity: 2 },
      { name: 'Aspirina 100mg', quantity: 1 },
    ],
  },
  {
    id: '2',
    date: '2024-07-10',
    items: [
      { name: 'Insulina Lantus', quantity: 1 },
    ],
  },
];

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

const PurchaseHistory: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

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

  const handleRegisterSale = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSuccess(false);
      setCart([]);
    }, 1500);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <h3 className="font-medium text-pharmacy-text1">Histórico de Compras</h3>
      </div>
      {mockPurchases.length === 0 && (
        <div className="text-sm text-pharmacy-text2 mb-2">Nenhuma compra registrada.</div>
      )}
      {mockPurchases.map((purchase) => (
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