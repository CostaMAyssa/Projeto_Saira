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
import NewCampaignModal from '@/components/campaigns/modals/NewCampaignModal';
import { NewCampaignData } from '@/services/dashboardService';
import ClientFormModal from '@/components/clients/ClientFormModal';

interface CustomerDetailsProps {
  activeConversation: string | null;
}

// Definindo um objeto CustomerDetailsType padrão para inicialização
const defaultCustomerDetails: CustomerDetailsType = {
  id: '',
  name: 'Cliente',
  phone: '',
  email: '',
  birthdate: '',
  tags: [],
  products: [],
  notes: '',
};

// Definir interface para os dados recebidos do NewCampaignModal
interface NewCampaignFormDataType {
  name: string;
  type: string;
  audience: string;
  schedule: string;
  status: 'active' | 'paused' | 'scheduled';
  lastRun: string;
  tags: Array<{ value: string; label: string; color: string }>;
  scheduleType: string;
  scheduleDate: Date | undefined;
  messageTemplate: string;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ activeConversation }) => {
  const [customerData, setCustomerData] = useState<CustomerDetailsType>(defaultCustomerDetails); // Inicializa com objeto padrão
  const [loading, setLoading] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isNewAutomationModalOpen, setIsNewAutomationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Buscar dados reais do cliente quando a conversa ativa muda
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!activeConversation) {
        console.log('🕵️ CustomerDetails: Nenhuma conversa ativa. Resetando para o padrão.');
        setCustomerData(defaultCustomerDetails);
        return;
      }

      setLoading(true);
      try {
        // Etapa 1: Buscar o client_id na tabela de conversas
        console.log('🔍 Etapa 1: Buscando client_id para a conversa ID:', activeConversation);
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('client_id')
          .eq('id', activeConversation)
          .single();

        if (convError || !conversation?.client_id) {
          console.error('❌ Erro ao buscar ID do cliente na conversa:', convError);
          setCustomerData(defaultCustomerDetails);
          setLoading(false);
          return;
        }

        const clientId = conversation.client_id;
        console.log(`✅ Etapa 1: client_id encontrado: ${clientId}`);

        // Etapa 2: Buscar os detalhes do cliente usando o client_id
        console.log(`🔍 Etapa 2: Buscando detalhes do cliente com ID: ${clientId}`);
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, name, phone, email, birth_date, tags, notes')
          .eq('id', clientId)
          .single();

        if (clientError || !clientData) {
          console.error('❌ Erro ao buscar os dados do cliente:', clientError);
          setCustomerData(defaultCustomerDetails);
          setLoading(false);
          return;
        }

        console.log('✅ Etapa 2: Dados do cliente encontrados:', clientData);

        // Montar o objeto final
        const customerDetails: CustomerDetailsType = {
          id: clientData.id || '',
          name: clientData.name || 'Cliente',
          phone: clientData.phone || '',
          email: clientData.email || '',
          birthdate: clientData.birth_date || '',
          tags: clientData.tags || [],
          products: customerData.products, // Manter produtos para não perder estado
          notes: clientData.notes || '',
        };

        setCustomerData(customerDetails);
        console.log('✅ CustomerDetails: Estado final do cliente definido:', customerDetails);

      } catch (error) {
        console.error('❌ CustomerDetails: Erro crítico no fetchCustomerData:', error);
        setCustomerData(defaultCustomerDetails);
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
  
  const handleAddTag = async (tag: string) => {
    if (customerData.tags.includes(tag)) {
      toast.error('Esta tag já existe para este cliente.');
      return;
    }
    
    // Tentar adicionar a tag no Supabase
    setLoading(true); // Ativar loading
    try {
      const updatedTags = [...customerData.tags, tag];
      const updatedClient = await dashboardService.updateClient(customerData.id, { tags: updatedTags });
      
      if (updatedClient) {
        setCustomerData(prevData => ({
          ...prevData,
          tags: updatedTags
        }));
        toast.success('Tag adicionada com sucesso e salva no banco de dados!');
      } else {
        toast.error('Falha ao adicionar tag: Não foi possível atualizar o cliente no banco de dados.');
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao adicionar tag:', error);
      let errorMessage = 'Ocorreu um erro inesperado ao adicionar a tag.';
      if (error instanceof Error) {
        errorMessage = `Ocorreu um erro ao adicionar a tag: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Ocorreu um erro ao adicionar a tag: ${error}`;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Desativar loading
    }
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
  
  const handleSaveNotes = async (notes: string) => {
    setCustomerData(prevData => ({
      ...prevData,
      notes
    }));
    try {
      await dashboardService.updateClient(customerData.id, { notes });
      toast.success('Observações atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar observações!');
    }
  };

  // Função para lidar com a criação de uma nova automação/campanha
  const handleCreateAutomation = async (campaignData: NewCampaignFormDataType) => {
    setLoading(true);
    try {
      // Adicionar o client_id ao target_audience da campanha
      const campaignToSave: NewCampaignData = {
        name: campaignData.name,
        trigger: campaignData.type, // Usar o tipo de campanha como trigger
        status: campaignData.status === 'active' ? 'ativa' : 
                campaignData.status === 'paused' ? 'pausada' : 'agendada',
        template: campaignData.messageTemplate || 'Template padrão',
        target_audience: {
          client_id: customerData.id, // Vincula a campanha ao cliente atual
          count: 1, // Para uma automação de cliente específico
          // Se houver tags ou outras segmentações específicas do cliente para automação, adicione aqui
          tags: campaignData.tags.map(tag => tag.value), // Exemplo: se as tags do form forem para segmentar o cliente
        },
        scheduled_for: campaignData.scheduleType === 'once' && campaignData.scheduleDate
                         ? new Date(campaignData.scheduleDate).toISOString()
                         : null,
      };

      console.log('🚧 Tentando criar campanha/automação com:', campaignToSave);
      const newCampaign = await dashboardService.createCampaign(campaignToSave);

      if (newCampaign) {
        toast.success('Automação criada com sucesso!');
        setIsNewAutomationModalOpen(false);
        // Talvez recarregar as automações do cliente aqui, se houver uma listagem.
      } else {
        toast.error('Falha ao criar automação.');
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao criar automação:', error);
      let errorMessage = 'Ocorreu um erro inesperado ao criar a automação.';
      if (error instanceof Error) {
        errorMessage = `Ocorreu um erro ao criar a automação: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Ocorreu um erro ao criar a automação: ${error}`;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="h-full bg-white border-l border-pharmacy-border1 overflow-y-auto">
      <div className="p-4 border-b border-pharmacy-border1">
        <div className="flex justify-between items-center">
          <CustomerHeader 
            customer={customerData} 
            onSave={handleUpdateCustomer} 
          />
          <button
            className="ml-2 px-3 py-1 rounded border border-pharmacy-accent text-pharmacy-accent bg-white text-sm hover:bg-pharmacy-accent hover:text-white transition-colors"
            onClick={() => setIsEditModalOpen(true)}
          >
            Editar
          </button>
        </div>
        <CustomerContactInfo 
          phone={customerData.phone}
          email={customerData.email}
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
        <CustomerAutomations 
          products={customerData.products} 
          onNovaAutomacaoClick={() => setIsNewAutomationModalOpen(true)} // Passa a função para abrir o modal de automação
        />
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

      <NewCampaignModal
        open={isNewAutomationModalOpen}
        onOpenChange={setIsNewAutomationModalOpen}
        onSubmit={handleCreateAutomation}
      />

      <ClientFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialClientData={{
          id: customerData.id,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          status: 'active', // Assumindo 'active', pois a conversa existe
          tags: customerData.tags,
          lastPurchase: '',
          // Campos que não existem em CustomerDetails, mas são esperados pelo modal
          isVip: customerData.tags.includes('VIP'), 
          isRegular: customerData.tags.includes('Regular'),
          isOccasional: customerData.tags.includes('Occasional'),
          profile_type: customerData.tags.includes('VIP') ? 'vip' : customerData.tags.includes('Regular') ? 'regular' : undefined,
          birth_date: customerData.birthdate || undefined,
        }}
        onSubmit={async (formData) => {
          // Mapeia status para o formato do banco
          const statusDb = formData.status === 'active' ? 'ativo' : 'inativo';
          await dashboardService.updateClient(customerData.id, {
            ...formData,
            status: statusDb,
            birth_date: formData.birth_date || null,
          });
          setIsEditModalOpen(false);
          // Recarregar dados do cliente após salvar
          // (opcional: pode chamar fetchCustomerData aqui se quiser)
        }}
      />
    </div>
  );
};

export default CustomerDetails;
