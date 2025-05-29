import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, LayoutGrid, Table as TableIcon } from 'lucide-react';
// import NewClientModal from './modals/NewClientModal'; // Replaced by ClientFormModal
import ClientFormModal from './ClientFormModal'; // Import the reusable modal
import { ClientModalFormData } from './ClientsModule'; // Import the FormData type

interface ClientSearchHeaderProps {
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  onAddClient: (formData: ClientModalFormData) => void; // Changed type to ClientModalFormData
  onSearch: (query: string) => void;
  isMobile?: boolean;
}

const ClientSearchHeader = ({ 
  viewMode, 
  setViewMode, 
  onAddClient, // This is handleAddClient from ClientsModule, expecting ClientModalFormData
  onSearch,
  isMobile = false
}: ClientSearchHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false); // Renamed for clarity

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  // The onAddClient prop is directly used by the modal's onSubmit
  // No need for a separate handleAddClient here if it just calls the prop.

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes</h1>
        <Button 
          className="bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white w-full sm:w-auto"
          onClick={() => setIsAddClientModalOpen(true)} // Open the new modal state
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-8 bg-white border-gray-300 focus:border-pharmacy-accent"
            value={searchQuery}
            onChange={handleSearchChange} // Use renamed handler
          />
        </div>
        
        {!isMobile && (
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              onClick={() => setViewMode('table')} 
              className={`rounded-none flex-1 ${viewMode === 'table' ? 'bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90' : 'bg-transparent text-pharmacy-accent hover:bg-gray-100'}`}
            >
              <TableIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tabela</span>
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'} 
              onClick={() => setViewMode('cards')} 
              className={`rounded-none flex-1 ${viewMode === 'cards' ? 'bg-pharmacy-accent text-white hover:bg-pharmacy-accent/90' : 'bg-transparent text-pharmacy-accent hover:bg-gray-100'}`}
            >
              <LayoutGrid className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
          </div>
        )}
      </div>

      {/* Use ClientFormModal for Adding New Client */}
      <ClientFormModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
        onSubmit={async (formData) => {
          const success = await onAddClient(formData); // onAddClient is handleAddClient from ClientsModule
          if (success) {
            setIsAddClientModalOpen(false); // Close modal on success
          }
        }}
        initialClientData={null} // No initial data for new client
      />
    </>
  );
};

export default ClientSearchHeader;
