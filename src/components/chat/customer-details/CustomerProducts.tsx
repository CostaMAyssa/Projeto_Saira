
import React from 'react';
import { Package, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  category: string;
  lastPurchase: string;
  continuous: boolean;
}

interface CustomerProductsProps {
  products: Product[];
}

const CustomerProducts: React.FC<CustomerProductsProps> = ({ products }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-4 w-4 text-pharmacy-green2" />
        <h3 className="font-medium text-white">Produtos Adquiridos</h3>
      </div>
      
      {products.map((product) => (
        <div key={product.id} className="mb-3 p-2 bg-pharmacy-dark2 rounded-xl">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-white">{product.name}</span>
            {product.continuous && (
              <Badge className="bg-pharmacy-accent text-white text-xs">Uso Contínuo</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-pharmacy-green2">{product.category}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Compra: {product.lastPurchase}</span>
            </div>
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Produto
      </Button>
    </div>
  );
};

export default CustomerProducts;
