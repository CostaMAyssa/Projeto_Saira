import React, { useState, useEffect } from 'react';
import CustomerHeader from './customer-details/CustomerHeader';
import CustomerContactInfo from './customer-details/CustomerContactInfo';
import CustomerTags from './customer-details/CustomerTags';
import CustomerProducts from './customer-details/CustomerProducts';
import CustomerAutomations from './customer-details/CustomerAutomations';
import CustomerNotes from './customer-details/CustomerNotes';
import { CustomerDetails as CustomerDetailsType } from './customer-details/types';
import { Product } from '@/components/products/types';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCreateForm from '@/components/products/ProductCreateForm';
import { dashboardService } from '@/services/dashboardService';

interface CustomerDetailsProps {
  activeConversation: string | null;
}

// Definindo um objeto CustomerDetailsType padrão para inicialização
const defaultCustomerDetails: CustomerDetailsType = {
  id: '',
  name: 'Cliente',
  phone: '',
  email: '',
  address: '',
  birthdate: '',
  tags: [],
  products: [],
  notes: '',
};

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ activeConversation }) => {
  const [customerData, setCustomerData] = useState<CustomerDetailsType>(defaultCustomerDetails); // Inicializa com objeto padrão
  const [loading, setLoading] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  // Buscar dados reais do cliente quando a conversa ativa muda
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!activeConversation) {
        setCustomerData(defaultCustomerDetails); // Resetar para padrão se não houver conversa ativa
        return;
      }

      setLoading(true);
      try {
        console.log('🔍 Buscando dados do cliente para conversa:', activeConversation);
        
        // AGORA ÚNICA TENTATIVA: Buscar dados da conversa e cliente (tabela conversations)
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select(`
            id,
            client_id,
            clients (
              id,
              name,
              phone,
              email,
              address,
              birthdate,
              notes
            )
          `)
          .eq('id', activeConversation)
          .single();

        if (!conversationError && conversationData?.clients) {
          console.log('✅ Dados encontrados na tabela conversations:', conversationData);
          
          const client = Array.isArray(conversationData.clients) 
            ? conversationData.clients[0] 
            : conversationData.clients;
          
          if (client) {
            const customerDetails: CustomerDetailsType = {
              id: client.id || '',
              name: client.name || 'Cliente',
              phone: client.phone || '',
              email: client.email || '',
              address: client.address || '',
              birthdate: client.birthdate || '',
              tags: customerData.tags,
              products: customerData.products,
              notes: client.notes || '',
            };
            
            setCustomerData(customerDetails);
            console.log('✅ Dados do cliente carregados da tabela conversations:', customerDetails);
            return;
          }
        }

        // Se chegou até aqui, não encontrou nada, resetar para padrão
        console.error('❌ Nenhum dado encontrado em nenhuma fonte para a conversa:', activeConversation);
        console.log('Erro de busca de dados da conversa:', { conversationError });
        setCustomerData(defaultCustomerDetails); // Resetar para padrão em caso de erro/não encontrado

      } catch (error) {
        console.error('❌ Erro crítico ao buscar dados do cliente:', error);
        setCustomerData(defaultCustomerDetails); // Resetar para padrão em caso de erro crítico
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [activeConversation]);
  
  if (!activeConversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-pharmacy-whatsapp-primary rounded-full opacity-10"></div>
          <div className="absolute inset-0 flex items-center justify-center text-pharmacy-whatsapp-primary">
            <MessageSquare size={32} />
          </div>
        </div>
        <div className="text-center text-pharmacy-text1">
          <p className="font-medium">Selecione uma conversa para</p>
          <p className="text-sm text-pharmacy-text2">ver detalhes do cliente</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pharmacy-accent mb-4"></div>
        <p className="text-pharmacy-text2">Carregando dados do cliente...</p>
      </div>
    );
  }
  
  const handleUpdateCustomer = (updatedCustomer: CustomerDetailsType) => {
    setCustomerData(updatedCustomer);
    toast.success('Dados do cliente atualizados com sucesso!');
  };
  
  const handleAddTag = (tag: string) => {
    if (customerData.tags.includes(tag)) {
      toast.error('Esta tag já existe para este cliente.');
      return;
    }
    
    setCustomerData(prevData => ({
      ...prevData,
      tags: [...prevData.tags, tag]
    }));
    
    toast.success('Tag adicionada com sucesso!');
  };
  
  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
    setLoading(true); // Ativar loading enquanto salva
    try {
      // Criar um objeto com os dados que serão salvos no banco de dados.
      const productToSave = {
        name: newProductData.name,
        category: newProductData.category,
        stock: newProductData.stock,
        interval: newProductData.interval,
        tags: newProductData.tags,
        needs_prescription: newProductData.needsPrescription,
        controlled: newProductData.controlled,
        // lastPurchase e continuous serão definidos pelo DashboardService ou Supabase
      };

      // Usar o DashboardService para criar o produto
      const savedProduct = await dashboardService.createProduct(productToSave);

      if (savedProduct) {
        // Adicionar o produto salvo (com o ID real do banco) ao estado local
        setCustomerData(prevData => ({
          ...prevData,
          products: [...prevData.products, savedProduct],
        }));
        
        toast.success('Produto adicionado com sucesso e salvo no banco de dados!');
        setIsAddProductModalOpen(false);
      } else {
        toast.error('Falha ao adicionar produto: Nenhum produto foi retornado após a criação.');
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao adicionar produto:', error);
      let errorMessage = 'Ocorreu um erro inesperado ao adicionar o produto.';
      if (error instanceof Error) {
        errorMessage = `Ocorreu um erro ao adicionar o produto: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Ocorreu um erro ao adicionar o produto: ${error}`;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Desativar loading
    }
  };
  
  const handleSaveNotes = (notes: string) => {
    setCustomerData(prevData => ({
      ...prevData,
      notes
    }));
    
    toast.success('Observações atualizadas com sucesso!');
  };
  
  return (
    <div className="h-full bg-white border-l border-pharmacy-border1 overflow-y-auto">
      <div className="p-4 border-b border-pharmacy-border1">
        <CustomerHeader 
          customer={customerData} 
          onSave={handleUpdateCustomer} 
        />
        
        <CustomerContactInfo 
          phone={customerData.phone}
          email={customerData.email}
          address={customerData.address}
          birthdate={customerData.birthdate}
        />
        
        <CustomerTags 
          tags={customerData.tags} 
          onAddTag={handleAddTag} 
        />
      </div>
      
      <div className="p-4 border-b border-pharmacy-border1">
        <CustomerProducts 
          products={customerData.products} 
          onAddProduct={() => setIsAddProductModalOpen(true)} // Agora sim, abre o ProductCreateForm
        />
      </div>
      
      <div className="p-4 border-b border-pharmacy-border1">
        <CustomerAutomations products={customerData.products} />
      </div>
      
      <div className="p-4">
        <CustomerNotes 
          notes={customerData.notes} 
          onSaveNotes={handleSaveNotes} 
        />
      </div>

      <ProductCreateForm
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleAddProduct} // handleAddProduct é passado aqui
      />
    </div>
  );
};

export default CustomerDetails;
