import React, { useState, useEffect, useMemo } from 'react';
import ClientSearchHeader from './ClientSearchHeader';
import ClientTable from './ClientTable';
import ClientsCardView from './ClientsCardView';
// import { mockClients } from './mockData'; // To be removed
import { getTagBadge, getStatusBadge } from './ClientUtilities';
import { Client } from './types';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase

const ClientsModule = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [clients, setClients] = useState<Client[]>([]); // Initialize with empty array
  const [filteredClients, setFilteredClients] = useState<Client[]>([]); // Initialize with empty array
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Verificar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*'); // Select all columns for now

      if (error) {
        console.error('Error fetching clients:', error);
        // Handle error appropriately
        return;
      }

      if (data) {
        const transformedClients: Client[] = data.map((dbClient: any) => ({
          id: dbClient.id,
          name: dbClient.name,
          phone: dbClient.phone,
          email: dbClient.email,
          status: dbClient.status === 'ativo' ? 'active' : 'inactive', // Map status
          tags: dbClient.tags || [], // Ensure tags is always an array
          // Format last_purchase: If it's a date/timestamp, format it. Otherwise, use as is or placeholder.
          // For simplicity, let's assume it's a string or can be displayed directly.
          // In a real app, you'd use date-fns or similar to format dbClient.last_purchase (timestamp)
          lastPurchase: dbClient.last_purchase ? new Date(dbClient.last_purchase).toLocaleDateString() : 'N/A',
          isVip: dbClient.is_vip || false,
          // Derive isRegular and isOccasional from profile_type
          isRegular: dbClient.profile_type === 'regular',
          isOccasional: dbClient.profile_type === 'occasional',
          // profile_type: dbClient.profile_type, // Optionally keep original profile_type if needed
        }));
        setClients(transformedClients);
        // setFilteredClients(transformedClients); // Initialize filtered list, search useEffect will handle it
      }
    };

    fetchClients();
  }, []);

  // Adicionar novo cliente (keeps mock functionality, does not save to DB)
  const handleAddClient = (newClient: Client) => {
    // This function would need to be updated to save to Supabase if persistence is required.
    // For now, it just adds to local state for UI testing.
    setClients(prevClients => [newClient, ...prevClients]);
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
    // Em dispositivos móveis, sempre mostrar cards
    if (isMobile) {
      return (
        <ClientsCardView 
          clients={filteredClients} 
          getStatusBadge={getStatusBadge} 
          getTagBadge={getTagBadge}
        />
      );
    }
    
    // Em desktops, mostrar de acordo com a preferência do usuário
    return viewMode === 'table' 
      ? <ClientTable 
          clients={filteredClients} 
          getStatusBadge={getStatusBadge} 
          getTagBadge={getTagBadge} 
        /> 
      : <ClientsCardView 
          clients={filteredClients} 
          getStatusBadge={getStatusBadge} 
          getTagBadge={getTagBadge}
        />;
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <ClientSearchHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        onAddClient={handleAddClient}
        onSearch={handleSearch}
        isMobile={isMobile}
      />
      
      {renderClientList()}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Exibindo {Math.min(filteredClients.length, clients.length)} de {clients.length} clientes
      </div>
    </div>
  );
};

export default ClientsModule;
