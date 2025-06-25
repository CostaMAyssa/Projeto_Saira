import React, { useState, useEffect } from 'react';
import CustomerHeader from './customer-details/CustomerHeader';
import CustomerContactInfo from './customer-details/CustomerContactInfo';
import CustomerTags from './customer-details/CustomerTags';
import CustomerProducts from './customer-details/CustomerProducts';
import CustomerAutomations from './customer-details/CustomerAutomations';
import CustomerNotes from './customer-details/CustomerNotes';
import { CustomerDetails as CustomerDetailsType, Product } from './customer-details/types';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerDetailsProps {
  activeConversation: string | null;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ activeConversation }) => {
  const [customerData, setCustomerData] = useState<CustomerDetailsType | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Buscar dados reais do cliente quando a conversa ativa muda
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!activeConversation) {
        setCustomerData(null);
        return;
      }

      setLoading(true);
      try {
        console.log('🔍 Buscando dados do cliente para conversa:', activeConversation);
        
        // PRIMEIRA TENTATIVA: Buscar na tabela chats (onde estão as conversas reais)
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('id, name, phone_number')
          .eq('id', activeConversation)
          .single();

        if (!chatError && chatData) {
          console.log('✅ Dados encontrados na tabela chats:', chatData);
          
          const customerDetails: CustomerDetailsType = {
            id: chatData.id,
            name: chatData.name || 'Cliente',
            phone: chatData.phone_number || '',
            email: '',
            address: '',
            birthdate: '',
            tags: [],
            products: [],
            notes: ''
          };
          
          setCustomerData(customerDetails);
          console.log('✅ Dados do cliente carregados da tabela chats:', customerDetails);
          return;
        }

        console.log('⚠️ Não encontrado na tabela chats, tentando conversations...');
        
        // SEGUNDA TENTATIVA: Buscar dados da conversa e cliente (tabela conversations)
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
              id: client.id,
              name: client.name || 'Cliente',
              phone: client.phone || '',
              email: client.email || '',
              address: client.address || '',
              birthdate: client.birthdate || '',
              tags: [],
              products: [],
              notes: client.notes || ''
            };
            
            setCustomerData(customerDetails);
            console.log('✅ Dados do cliente carregados da tabela conversations:', customerDetails);
            return;
          }
        }

        console.log('⚠️ Não encontrado em conversations, tentando unified_conversations...');

        // TERCEIRA TENTATIVA: Fallback para view unified_conversations
        const { data: unifiedData, error: unifiedError } = await supabase
          .from('unified_conversations')
          .select('name, phone_number')
          .eq('id', activeConversation)
          .single();

        if (!unifiedError && unifiedData) {
          console.log('✅ Dados encontrados na view unified_conversations:', unifiedData);
          
          const basicCustomerData: CustomerDetailsType = {
            id: activeConversation,
            name: unifiedData.name || 'Cliente',
            phone: unifiedData.phone_number || '',
            email: '',
            address: '',
            birthdate: '',
            tags: [],
            products: [],
            notes: ''
          };
          
          setCustomerData(basicCustomerData);
          console.log('✅ Dados do cliente carregados da view unified_conversations:', basicCustomerData);
          return;
        }

        // Se chegou até aqui, não encontrou nada
        console.error('❌ Nenhum dado encontrado em nenhuma fonte para a conversa:', activeConversation);
        console.log('Erros encontrados:', { chatError, conversationError, unifiedError });
        setCustomerData(null);

      } catch (error) {
        console.error('❌ Erro crítico ao buscar dados do cliente:', error);
        setCustomerData(null);
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

  if (!customerData) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center text-pharmacy-text1">
          <p className="font-medium">Dados do cliente não encontrados</p>
          <p className="text-sm text-pharmacy-text2">Verifique se o cliente está cadastrado</p>
        </div>
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
    
    setCustomerData({
      ...customerData,
      tags: [...customerData.tags, tag]
    });
    
    toast.success('Tag adicionada com sucesso!');
  };
  
  const handleAddProduct = (product: Product) => {
    setCustomerData({
      ...customerData,
      products: [...customerData.products, product]
    });
    
    toast.success('Produto adicionado com sucesso!');
  };
  
  const handleSaveNotes = (notes: string) => {
    setCustomerData({
      ...customerData,
      notes
    });
    
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
          onAddProduct={handleAddProduct} 
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
    </div>
  );
};

export default CustomerDetails;
