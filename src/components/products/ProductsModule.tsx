
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductsHeader from './ProductsHeader';
import { mockProducts } from './mockData';
import { Product } from './types';

const ProductsModule = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleAddProduct = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de adicionar produtos em desenvolvimento.",
    });
  };

  const handleEditProduct = (id: string) => {
    toast({
      title: "Em desenvolvimento",
      description: `Edição do produto ${id} em desenvolvimento.`,
    });
  };

  const handleViewDetails = (id: string) => {
    toast({
      title: "Em desenvolvimento",
      description: `Detalhes do produto ${id} em desenvolvimento.`,
    });
  };

  const filteredProducts = activeFilter
    ? mockProducts.filter(product => 
        product.tags.some(tag => tag === activeFilter) || 
        product.category === activeFilter)
    : mockProducts;

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <ProductsHeader onAddProduct={handleAddProduct} />
      <ProductFilters 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onEdit={handleEditProduct}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsModule;
