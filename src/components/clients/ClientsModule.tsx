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

// Define a type for the data expected from a client form (modal)
export type ClientModalFormData = {
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  tags?: string[];
  is_vip?: boolean;
  profile_type: 'regular' | 'occasional' | 'vip';
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
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state

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
      const { data, error: fetchError } = await supabase.from('clients').select('*').order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const transformedClients: Client[] = data.map((dbClient: any) => ({
          id: dbClient.id,
          name: dbClient.name,
          phone: dbClient.phone,
          email: dbClient.email || '',
          status: dbClient.status === 'ativo' ? 'active' : 'inactive',
          tags: dbClient.tags || [],
          lastPurchase: dbClient.last_purchase ? new Date(dbClient.last_purchase).toLocaleDateString('pt-BR') : 'N/A',
          isVip: dbClient.is_vip || false,
          profile_type: dbClient.profile_type || 'regular'
        }));
        setClients(transformedClients);
      }
    } catch (err: any) {
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

  const handleAddClient = async (formData: ClientModalFormData) => {
    const clientDataToSave: ClientData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      status: formData.status === 'active' ? 'ativo' : 'inativo',
      tags: formData.tags || [],
      is_vip: formData.is_vip || false,
      profile_type: formData.profile_type,
      birth_date: formData.birth_date || null,
      created_at: new Date().toISOString(),
      created_by: null, // Será preenchido quando implementarmos autenticação
      last_purchase: null
    };

    try {
      await dashboardService.createClient(clientDataToSave);
      toast.success('Cliente adicionado com sucesso!');
      fetchClientsData(); // Refresh list
    } catch (err: any) {
      console.error("Error creating client:", err);
      // Verificar se é o erro de telefone duplicado
      if (err.message && err.message.includes('telefone')) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao adicionar cliente. Por favor, tente novamente.');
      }
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
    } catch (err) {
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
      } catch (err) {
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
    } catch (err) {
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
  const renderClientList = () => {
    const listProps = {
      clients: filteredClients,
      getStatusBadge,
      getTagBadge,
      // Pass down new handlers to ClientTable (and potentially ClientsCardView if it supports these actions)
      onEditClient: handleSaveClientUpdate, // ClientTable's handleSaveEdit will call this
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

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <ClientSearchHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        onAddClient={handleAddClient} // This will be called by ClientSearchHeader's modal
        onSearch={handleSearch}
        isMobile={isMobile}
      />
      
      {renderClientList()}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Exibindo {filteredClients.length} de {clients.length} cliente(s)
      </div>
    </div>
  );
};

export default ClientsModule;
