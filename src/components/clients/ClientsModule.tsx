import React, { useState, useEffect, useMemo } from 'react';
import ClientSearchHeader from './ClientSearchHeader';
import ClientTable from './ClientTable';
import ClientsCardView from './ClientsCardView';
import { mockClients } from './mockData';
import { getTagBadge, getStatusBadge } from './ClientUtilities';
import { Client } from './types';

const ClientsModule = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [filteredClients, setFilteredClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Verificar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Verificar na inicialização
    checkIfMobile();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Adicionar novo cliente
  const handleAddClient = (newClient: Client) => {
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
