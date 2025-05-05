
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Package, Plus } from 'lucide-react';

const ProductsModule = () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Losartana 50mg',
      category: 'Anti-hipertensivo',
      price: 'R$ 22,90',
      stock: 45,
      tags: ['uso contínuo', 'hipertensão'],
    },
    {
      id: '2',
      name: 'Insulina Lantus',
      category: 'Antidiabético',
      price: 'R$ 89,90',
      stock: 12,
      tags: ['uso contínuo', 'diabetes'],
    },
    {
      id: '3',
      name: 'Aspirina 100mg',
      category: 'Analgésico',
      price: 'R$ 15,50',
      stock: 78,
      tags: ['uso contínuo', 'anticoagulante'],
    },
    {
      id: '4',
      name: 'Amoxicilina 500mg',
      category: 'Antibiótico',
      price: 'R$ 32,70',
      stock: 23,
      tags: ['antibiótico', 'infecção'],
    },
    {
      id: '5',
      name: 'Dipirona 1g',
      category: 'Analgésico',
      price: 'R$ 12,30',
      stock: 65,
      tags: ['analgésico', 'antitérmico'],
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-pharmacy-dark1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Produtos</h1>
        <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos por nome ou categoria..."
            className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
        </div>
        <Button variant="outline" className="text-pharmacy-green2 border-pharmacy-green1">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
      
      <div className="bg-pharmacy-dark2 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-dark1 text-pharmacy-green2 font-medium">
          <div className="col-span-4">Nome</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-2">Preço</div>
          <div className="col-span-2">Estoque</div>
          <div className="col-span-2">Tags</div>
        </div>
        
        {mockProducts.map((product) => (
          <div 
            key={product.id} 
            className="grid grid-cols-12 gap-4 p-4 border-b border-pharmacy-dark1 hover:bg-pharmacy-dark1 cursor-pointer"
          >
            <div className="col-span-4">
              <div className="text-white font-medium">{product.name}</div>
            </div>
            <div className="col-span-2 text-muted-foreground">{product.category}</div>
            <div className="col-span-2 text-white">{product.price}</div>
            <div className="col-span-2">
              <span className={`text-sm ${product.stock > 20 ? 'text-green-500' : product.stock > 10 ? 'text-yellow-500' : 'text-red-500'}`}>
                {product.stock} unidades
              </span>
            </div>
            <div className="col-span-2 flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="bg-pharmacy-dark1 border-pharmacy-green1 text-xs text-pharmacy-green2"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Exibindo 5 de 78 produtos
      </div>
    </div>
  );
};

export default ProductsModule;
