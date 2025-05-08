
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductsHeaderProps {
  onAddProduct: () => void;
}

const ProductsHeader = ({ onAddProduct }: ProductsHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Produtos</h1>
      <Button 
        className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
        size={isMobile ? "sm" : "default"}
        onClick={onAddProduct}
      >
        <Plus className="mr-1 sm:mr-2 h-4 w-4" />
        {isMobile ? "Novo" : "Novo Produto"}
      </Button>
    </div>
  );
};

export default ProductsHeader;
