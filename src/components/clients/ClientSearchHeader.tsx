import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, LayoutGrid, Table as TableIcon } from 'lucide-react';
import NewClientModal from './modals/NewClientModal';
import { Client } from './types';

interface ClientSearchHeaderProps {
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  onAddClient: (client: Client) => void;
  onSearch: (query: string) => void;
  isMobile?: boolean;
}

const ClientSearchHeader = ({ 
  viewMode, 
  setViewMode, 
  onAddClient, 
  onSearch,
  isMobile = false
}: ClientSearchHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleAddClient = (clientData: Client) => {
    onAddClient(clientData);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Clientes</h1>
        <Button 
          className="bg-pharmacy-accent hover:bg-pharmacy-green1 text-white w-full sm:w-auto"
          onClick={() => setIsNewClientModalOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        {!isMobile && (
          <div className="flex border border-pharmacy-green1 rounded-md overflow-hidden">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              onClick={() => setViewMode('table')} 
              className={`rounded-none flex-1 ${viewMode === 'table' ? 'bg-pharmacy-accent' : 'bg-transparent text-pharmacy-green2'}`}
            >
              <TableIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tabela</span>
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'} 
              onClick={() => setViewMode('cards')} 
              className={`rounded-none flex-1 ${viewMode === 'cards' ? 'bg-pharmacy-accent' : 'bg-transparent text-pharmacy-green2'}`}
            >
              <LayoutGrid className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Novo Cliente */}
      <NewClientModal 
        isOpen={isNewClientModalOpen} 
        onClose={() => setIsNewClientModalOpen(false)} 
        onSave={handleAddClient}
      />
    </>
  );
};

export default ClientSearchHeader;
