
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, UserPlus, LayoutGrid, Table as TableIcon } from 'lucide-react';

interface ClientSearchHeaderProps {
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
}

const ClientSearchHeader = ({ viewMode, setViewMode }: ClientSearchHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <Button className="bg-pharmacy-accent hover:bg-pharmacy-green1 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-pharmacy-green2 border-pharmacy-green1">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <div className="flex border border-pharmacy-green1 rounded-md overflow-hidden">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              onClick={() => setViewMode('table')} 
              className={`rounded-none ${viewMode === 'table' ? 'bg-pharmacy-accent' : 'bg-transparent text-pharmacy-green2'}`}
            >
              <TableIcon className="h-4 w-4" />
              <span className="ml-2">Tabela</span>
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'outline'} 
              onClick={() => setViewMode('cards')} 
              className={`rounded-none ${viewMode === 'cards' ? 'bg-pharmacy-accent' : 'bg-transparent text-pharmacy-green2'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="ml-2">Cards</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientSearchHeader;
