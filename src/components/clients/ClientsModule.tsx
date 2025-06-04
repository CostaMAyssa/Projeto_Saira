import React, { useState, useEffect, useMemo } from 'react';
import ClientSearchHeader from './ClientSearchHeader';
import ClientTable from './ClientTable';
import ClientsCardView from './ClientsCardView';
// import { mockClients } from './mockData'; // To be removed
import { getTagBadge, getStatusBadge } from './ClientUtilities';
import { Client } from './types';
import { supabase } from '@/lib/supabase'; // Import Supabase
import { dashboardService, ClientData } from '../../services/dashboardService'; // MOVED
import { toast } from 'sonner'; // MOVED
import { Button } from '@/components/ui/button';
import ClientFormModal from './ClientFormModal';
import { diagnoseClientsData, fixOrphanClients } from '@/debug/client-diagnosis'; // 🔍 DEBUG

// Define a type for the data expected from a client form (modal) - Moved to top level
export type ClientModalFormData = {
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive'; // UI status
  tags?: string[];
  is_vip?: boolean;
  profile_type?: 'regular' | 'occasional' | 'vip';
  birth_date?: string; // YYYY-MM-DD for date input
};

const ClientsModule = () => {
  // Removed the first set of state declarations and the first useEffect for mobile check,
  // as they were duplicated by the second block.
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Edit Modal
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [selectedClientToEdit, setSelectedClientToEdit] = useState<Client | null>(null);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 640);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchClientsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer consulta
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }
      const userId = user.id;

      console.log('ClientsModule: Buscando clientes para usuário:', userId);

      // Consulta com filtro por usuário - CORRIGIDO VAZAMENTO DE DADOS
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('created_by', userId) // 🔒 FILTRO POR USUÁRIO ADICIONADO
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const transformedClients: Client[] = data.map((dbClient: unknown): Client => {
          const client = dbClient as {
            id: string;
            name: string;
            phone: string;
            email?: string;
            status: string;
            tags?: string[];
            last_purchase?: string;
            is_vip?: boolean;
            profile_type?: string;
            birth_date?: string;
          };
          
          return {
            id: client.id,
            name: client.name,
            phone: client.phone,
            email: client.email || '', // Ensure email is not null
            status: client.status === 'ativo' ? 'active' : 'inactive',
            tags: client.tags || [],
            lastPurchase: client.last_purchase ? new Date(client.last_purchase).toLocaleDateString('pt-BR') : 'N/A',
            isVip: client.is_vip || false,
            isRegular: client.profile_type === 'regular',
            isOccasional: client.profile_type === 'occasional',
            profile_type: client.profile_type as 'regular' | 'occasional' | 'vip' | undefined,
            birth_date: client.birth_date,
          };
        });
        setClients(transformedClients);
        console.log('ClientsModule: Clientes carregados:', transformedClients.length);
      }
    } catch (err: unknown) {
      console.error('Error fetching clients:', err);
      setError('Falha ao carregar clientes.');
      toast.error('Falha ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClientsData();
  }, []);

  const handleAddClient = async (formData: ClientModalFormData): Promise<boolean> => {
    const clientDataToSave: ClientData = {
      ...formData,
      email: formData.email || null, // Ensure null if empty string for DB
      tags: formData.tags || null,
      is_vip: formData.is_vip || null,
      profile_type: formData.profile_type || null,
      birth_date: formData.birth_date || null,
      status: formData.status === 'active' ? 'ativo' : 'inativo', // Map to DB status
    };
    try {
      await dashboardService.createClient(clientDataToSave);
      toast.success('Cliente adicionado com sucesso!');
      fetchClientsData(); // Refresh list
      return true; // Indicate success
    } catch (err: unknown) {
      console.error("Error creating client:", err);
      toast.error('Erro ao adicionar cliente.');
      return false; // Indicate failure
    }
  };
  
  const handleSaveClientUpdate = async (clientId: string, formData: ClientModalFormData) => {
     const clientDataToUpdate: Partial<ClientData> = {
      ...formData,
      email: formData.email || undefined, // Use undefined for partial update if email is empty string
      tags: formData.tags,
      is_vip: formData.is_vip,
      profile_type: formData.profile_type,
      birth_date: formData.birth_date,
      status: formData.status === 'active' ? 'ativo' : 'inativo',
    };
    try {
      await dashboardService.updateClient(clientId, clientDataToUpdate);
      toast.success('Cliente atualizado com sucesso!');
      fetchClientsData();
      return true; // Indicate success for modal closing
    } catch (err: unknown) {
      console.error("Error updating client:", err);
      toast.error('Erro ao atualizar cliente.');
      return false; // Indicate failure
    }
  };

  const handleDeleteClientFromModule = async (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await dashboardService.deleteClient(clientId);
        toast.success('Cliente excluído com sucesso!');
        fetchClientsData();
      } catch (err: unknown) {
        console.error("Error deleting client:", err);
        toast.error('Erro ao excluir cliente.');
      }
    }
  };
  
  const handleToggleClientStatusInModule = async (client: Client) => {
    const newDbStatus = client.status === 'active' ? 'inativo' : 'ativo';
    try {
      await dashboardService.updateClient(client.id, { status: newDbStatus });
      toast.success(`Status do cliente alterado para ${newDbStatus === 'ativo' ? 'ativo' : 'inativo'}.`);
      fetchClientsData();
    } catch (err: unknown) {
      console.error("Error updating client status:", err);
      toast.error('Erro ao alterar status do cliente.');
    }
  };

  // Função de busca
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filtragem de clientes baseada na busca
  useEffect(() => {
    // Começar com todos os clientes
    let result = [...clients];

    // Aplicar busca por texto
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(client => 
        client.name.toLowerCase().includes(lowercaseQuery) ||
        client.email.toLowerCase().includes(lowercaseQuery) ||
        client.phone.includes(searchQuery)
      );
    }

    setFilteredClients(result);
  }, [clients, searchQuery]);

  // Contar clientes ativos para estatísticas
  const totalActiveClients = useMemo(() => {
    return clients.filter(client => client.status === 'active').length;
  }, [clients]);

  // 🔍 DEBUG: Função de diagnóstico temporária
  const handleDiagnosis = async () => {
    console.log('🔍 Iniciando diagnóstico...');
    const result = await diagnoseClientsData();
    console.log('📊 Resultado do diagnóstico:', result);
    
    if (result.orphanClients > 0) {
      const shouldFix = window.confirm(
        `Foram encontrados ${result.orphanClients} clientes órfãos (sem dono). ` +
        `Deseja atribuí-los ao usuário atual?`
      );
      
      if (shouldFix && result.currentUserId) {
        const fixResult = await fixOrphanClients(result.currentUserId);
        if (fixResult.fixed) {
          toast.success(`${fixResult.fixed} clientes órfãos foram corrigidos!`);
          fetchClientsData(); // Atualizar lista
        }
      }
    } else {
      toast.success('Diagnóstico concluído! Verifique o console para detalhes.');
    }
  };

  // Determinar o componente a ser renderizado (tabela ou cards)
  const handleOpenEditClientModal = (client: Client) => {
    console.log('ClientsModule: Opening edit modal for client:', client);
    try {
      setSelectedClientToEdit(client);
      setIsEditClientModalOpen(true);
      console.log('ClientsModule: Modal state set successfully');
    } catch (error) {
      console.error('ClientsModule: Error opening edit modal:', error);
    }
  };

  const handleCloseEditClientModal = () => {
    setIsEditClientModalOpen(false);
    setSelectedClientToEdit(null);
  };

  const renderClientList = () => {
    const listProps = {
      clients: filteredClients,
      getStatusBadge,
      getTagBadge,
      onOpenEditModal: handleOpenEditClientModal,
      onDeleteClient: handleDeleteClientFromModule,
      onToggleStatus: handleToggleClientStatusInModule,
    };

    if (loading) {
      return <div className="flex justify-center items-center h-64">Carregando clientes...</div>;
    }
    if (error) {
      return <div className="flex flex-col justify-center items-center h-64 text-red-500">
               <p>{error}</p>
               <Button onClick={fetchClientsData} className="mt-2">Tentar Novamente</Button>
             </div>;
    }
    if (filteredClients.length === 0 && !searchQuery) {
        return <div className="text-center py-10 text-gray-500">Nenhum cliente cadastrado ainda.</div>;
    }
    if (filteredClients.length === 0 && searchQuery) {
        return <div className="text-center py-10 text-gray-500">Nenhum cliente encontrado para "{searchQuery}".</div>;
    }

    if (isMobile) {
      // ClientsCardView might need props for edit/delete if those actions are available on cards
      return <ClientsCardView {...listProps} />;
    }
    
    return viewMode === 'table' 
      ? <ClientTable {...listProps} /> 
      : <ClientsCardView {...listProps} />;
  };

  return ( // This is the main return statement
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <ClientSearchHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        onAddClient={handleAddClient} // This will call ClientsModule.handleAddClient
        onSearch={handleSearch}
        isMobile={isMobile}
      />
      
      {/* 🔍 DEBUG: Botão de diagnóstico temporário */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Diagnóstico de Dados</h3>
            <p className="text-xs text-yellow-600">Verificar problemas com dados de clientes</p>
          </div>
          <Button 
            onClick={handleDiagnosis}
            size="sm"
            variant="outline"
            className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
          >
            🔍 Diagnosticar
          </Button>
        </div>
      </div>
      
      {renderClientList()}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Exibindo {filteredClients.length} de {clients.length} cliente(s)
      </div>

      {/* Edit Client Modal using ClientFormModal */}
      {selectedClientToEdit && selectedClientToEdit.id && (
        <div key={`edit-modal-${selectedClientToEdit.id}`}>
          <ClientFormModal
            isOpen={isEditClientModalOpen}
            onClose={handleCloseEditClientModal}
            initialClientData={selectedClientToEdit}
            onSubmit={async (formDataFromModal) => {
              try {
                console.log('ClientsModule: Submitting edit form:', formDataFromModal);
                const success = await handleSaveClientUpdate(selectedClientToEdit.id, formDataFromModal);
                if (success) {
                  handleCloseEditClientModal();
                }
              } catch (error) {
                console.error('ClientsModule: Error submitting edit form:', error);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ClientsModule;
