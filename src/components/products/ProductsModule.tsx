
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import ProductsHeader from './ProductsHeader';
import ProductDetails from './ProductDetails';
import ProductEditForm from './ProductEditForm';
import ProductCreateForm from './ProductCreateForm';
// import { mockProducts } from './mockData'; // To be removed
import { Product } from './types';
import { supabase } from '@/lib/supabase'; // Import Supabase
import { useEffect } from 'react'; // Import useEffect
import { dashboardService, ProductData } from '../../services/dashboardService'; // MOVED
import { AlertTriangle } from 'lucide-react'; // MOVED

// Single, consolidated ProductsModule component definition
const ProductsModule = () => {
  // Removed the first set of state declarations, as they were duplicated by the second block.
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state


  const fetchProductsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Direct Supabase call was here, ideally this could be a service method e.g. dashboardService.getAllProducts()
      // For now, keeping direct fetch as per previous structure, but noting for consistency.
      const { data, error: fetchError } = await supabase.from('products').select('*').order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const transformedProducts: Product[] = data.map((dbProduct: any) => ({
          id: dbProduct.id,
          name: dbProduct.name,
          category: dbProduct.category || '', // Ensure not null
          stock: dbProduct.stock || 0, // Ensure not null
          interval: dbProduct.interval,
          tags: dbProduct.tags || [],
          needsPrescription: dbProduct.needs_prescription || false,
          controlled: dbProduct.controlled || false,
        }));
        setProducts(transformedProducts);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      const errorMessage = "Falha ao carregar produtos.";
      setError(errorMessage);
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);
  
  const handleAddProduct = () => {
    setSelectedProduct(null); // Clear any selected product for edit before opening create
    setIsCreateFormOpen(true);
  };

  // ProductCreateForm's onSave calls this
  const handleCreateProduct = async (formData: Omit<Product, 'id'>) => {
    const productDataToSave: ProductData = {
      name: formData.name,
      category: formData.category,
      stock: formData.stock,
      tags: formData.tags,
      needs_prescription: formData.needsPrescription,
      controlled: formData.controlled,
      interval: formData.interval,
    };
    try {
      await dashboardService.createProduct(productDataToSave);
      toast({ title: "Sucesso", description: `Produto ${formData.name} criado com sucesso.` });
      fetchProductsData(); // Refresh list
      setIsCreateFormOpen(false);
    } catch (err) {
      console.error("Error creating product:", err);
      toast({ title: "Erro", description: "Falha ao criar produto.", variant: "destructive" });
    }
  };

  // ProductCard's onEdit calls this
  const handleEditProduct = (productId: string) => {
    const productToEdit = products.find(p => p.id === productId);
    if (productToEdit) {
      setSelectedProduct(productToEdit);
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

  // ProductEditForm's onSave calls this
  const handleSaveProductEdit = async (updatedProductData: Product) => {
    if (!selectedProduct || selectedProduct.id !== updatedProductData.id) {
        toast({ title: "Erro", description: "Produto selecionado inválido para edição.", variant: "destructive"});
        return;
    }
    const productDataToUpdate: Partial<ProductData> = {
      name: updatedProductData.name,
      category: updatedProductData.category,
      stock: updatedProductData.stock,
      tags: updatedProductData.tags,
      needs_prescription: updatedProductData.needsPrescription,
      controlled: updatedProductData.controlled,
      interval: updatedProductData.interval,
    };
    try {
      await dashboardService.updateProduct(selectedProduct.id, productDataToUpdate);
      toast({ title: "Sucesso", description: `Produto ${updatedProductData.name} atualizado com sucesso.` });
      fetchProductsData(); // Refresh list
      setIsEditFormOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error updating product:", err);
      toast({ title: "Erro", description: "Falha ao atualizar produto.", variant: "destructive" });
    }
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

      {loading && <div className="flex justify-center items-center h-64">Carregando produtos...</div>}
      {error && !loading && (
        <div className="flex flex-col justify-center items-center h-64 text-red-500">
          <AlertTriangle className="h-10 w-10 mb-2" />
          <p>{error}</p>
          <Button onClick={fetchProductsData} className="mt-4">Tentar Novamente</Button>
        </div>
      )}
      
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          {searchQuery || activeFilter ? <p className="text-gray-400">Tente ajustar seus filtros ou termos de busca</p> : <p className="text-gray-400">Cadastre novos produtos para começar.</p>}
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={handleEditProduct} // This now correctly opens edit form with selectedProduct
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
