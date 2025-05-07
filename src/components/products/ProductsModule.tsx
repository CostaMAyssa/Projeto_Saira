import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductsHeader from './ProductsHeader';
import ProductDetails from './ProductDetails';
import ProductEditForm from './ProductEditForm';
import { mockProducts } from './mockData';
import { Product } from './types';

const ProductsModule = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();
  
  const handleAddProduct = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de adicionar produtos em desenvolvimento.",
    });
  };

  const handleEditProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSelectedProduct(product);
      setIsEditFormOpen(true);
    }
  };

  const handleViewDetails = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setSelectedProduct(product);
      setIsDetailsOpen(true);
    }
  };

  const handleSaveProductEdit = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    
    setIsEditFormOpen(false);
    toast({
      title: "Produto atualizado",
      description: `As alterações no produto ${updatedProduct.name} foram salvas com sucesso.`,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedProduct(null);
  };

  const closeEditForm = () => {
    setIsEditFormOpen(false);
    setSelectedProduct(null);
  };

  // Filtra produtos por tag/categoria e por texto de busca
  const filteredProducts = products
    .filter(product => {
      // Primeiro filtra por tag/categoria
      if (activeFilter) {
        return product.tags.some(tag => tag === activeFilter) || 
               product.category === activeFilter;
      }
      return true;
    })
    .filter(product => {
      // Depois filtra por texto de busca
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <ProductsHeader onAddProduct={handleAddProduct} />
      <ProductFilters 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter}
        onSearch={handleSearch}
      />
      
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          <p className="text-gray-400">Tente ajustar seus filtros ou termos de busca</p>
        </div>
      ) : (
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
      )}

      <ProductDetails
        isOpen={isDetailsOpen}
        onClose={closeDetailsModal}
        product={selectedProduct}
      />

      <ProductEditForm
        isOpen={isEditFormOpen}
        onClose={closeEditForm}
        product={selectedProduct}
        onSave={handleSaveProductEdit}
      />
    </div>
  );
};

export default ProductsModule;
