
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductsHeader from './ProductsHeader';
import ProductDetails from './ProductDetails';
import ProductEditForm from './ProductEditForm';
import ProductCreateForm from './ProductCreateForm';
import { mockProducts } from './mockData';
import { Product } from './types';

const ProductsModule = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleAddProduct = () => {
    setIsCreateFormOpen(true);
  };

  const handleCreateProduct = (newProduct: Omit<Product, 'id'>) => {
    // Gerar ID único baseado no timestamp
    const id = `product-${Date.now()}`;
    const product: Product = {
      id,
      ...newProduct
    };
    
    setProducts(prevProducts => [...prevProducts, product]);
    setIsCreateFormOpen(false);
    
    toast({
      title: "Produto adicionado",
      description: `O produto ${newProduct.name} foi adicionado com sucesso.`,
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

  const closeCreateForm = () => {
    setIsCreateFormOpen(false);
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
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
      <ProductsHeader onAddProduct={handleAddProduct} />
      <ProductFilters 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter}
        onSearch={handleSearch}
        isMobile={isMobile}
      />
      
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          <p className="text-gray-400">Tente ajustar seus filtros ou termos de busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={handleEditProduct}
              onViewDetails={handleViewDetails}
              isMobile={isMobile}
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

      <ProductCreateForm
        isOpen={isCreateFormOpen}
        onClose={closeCreateForm}
        onSave={handleCreateProduct}
      />
    </div>
  );
};

export default ProductsModule;
