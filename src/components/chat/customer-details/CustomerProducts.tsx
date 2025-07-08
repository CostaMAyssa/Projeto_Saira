import React, { useState } from 'react';
import { Package, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '../../products/types';

interface CustomerProductsProps {
  products: Product[];
  onAddProduct: () => void;
}

const CustomerProducts: React.FC<CustomerProductsProps> = ({ products, onAddProduct }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <h3 className="font-medium text-pharmacy-text1">Produtos Adquiridos</h3>
      </div>
      
      {products.map((product) => (
        <div key={product.id} className="mb-3 p-2 bg-pharmacy-light2 rounded-xl">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-pharmacy-text1">{product.name}</span>
            {product.continuous && (
              <Badge className="bg-pharmacy-whatsapp-primary text-white text-xs">Uso Contínuo</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-pharmacy-text2">{product.category}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-pharmacy-text2" />
              <span className="text-xs text-pharmacy-text2">Compra: {product.lastPurchase}</span>
            </div>
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-whatsapp-primary border-pharmacy-border1 hover:bg-pharmacy-whatsapp-primary hover:text-white mt-2"
        onClick={onAddProduct}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Produto
      </Button>
    </div>
  );
};

export default CustomerProducts;
