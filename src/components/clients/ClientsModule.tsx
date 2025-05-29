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
      // The direct Supabase call was here before, now we should ensure this logic is consistent
      // with how dashboardService might fetch or if we keep direct fetching here.
      // For consistency with the task (using dashboardService for CRUD), let's assume
      // a getClients method could be in dashboardService, or use direct Supabase here for read.
      // The previous code used direct supabase.from('clients').select('*').
      // Let's keep that for fetching all clients for now.
      const { data, error: fetchError } = await supabase.from('clients').select('*').order('created_at', { ascending: false });

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
