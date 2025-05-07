import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductsHeaderProps {
  onAddProduct: () => void;
}

const ProductsHeader = ({ onAddProduct }: ProductsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
      <Button 
        className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
        onClick={onAddProduct}
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Produto
      </Button>
    </div>
  );
};

export default ProductsHeader;
