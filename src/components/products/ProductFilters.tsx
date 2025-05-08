
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductFiltersProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  onSearch: (query: string) => void;
  isMobile?: boolean;
}

const ProductFilters = ({ activeFilter, setActiveFilter, onSearch, isMobile = false }: ProductFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const getFilterButtonClass = (filter: string | null) => {
    const baseClass = "text-white font-medium text-xs sm:text-sm whitespace-nowrap";
    const activeClass = activeFilter === filter ? "opacity-100" : "opacity-80 hover:opacity-100";
    
    if (filter === "Uso Contínuo") {
      return `${baseClass} ${activeClass} bg-pharmacy-green2 hover:bg-pharmacy-green2/90`;
    } else if (filter === "Controlado") {
      return `${baseClass} ${activeClass} bg-pharmacy-accent hover:bg-pharmacy-accent/90`;
    } else if (filter === "Antibiótico") {
      return `${baseClass} ${activeClass} bg-pharmacy-green1 hover:bg-pharmacy-green1/90`;
    } else {
      // Default "Todos" button
      return `${baseClass} ${activeClass} bg-gray-700 hover:bg-gray-700/90`;
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0 ${isMobile ? 'space-y-3 sm:space-y-0' : ''}`}>
      <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
        <Button 
          className={getFilterButtonClass(null)}
          onClick={() => setActiveFilter(null)}
          size={isMobile ? "sm" : "default"}
        >
          Todos
        </Button>
        <Button 
          className={getFilterButtonClass("Uso Contínuo")}
          onClick={() => handleFilterClick("Uso Contínuo")}
          size={isMobile ? "sm" : "default"}
        >
          Uso Contínuo
        </Button>
        <Button 
          className={getFilterButtonClass("Controlado")}
          onClick={() => handleFilterClick("Controlado")}
          size={isMobile ? "sm" : "default"}
        >
          Controlados
        </Button>
        <Button 
          className={getFilterButtonClass("Antibiótico")}
          onClick={() => handleFilterClick("Antibiótico")}
          size={isMobile ? "sm" : "default"}
        >
          Antibióticos
        </Button>
      </div>
      
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar produto..."
          className="pl-10 pr-4 py-2 bg-white border-gray-200 text-gray-900 rounded-md w-full sm:w-64 focus:ring-pharmacy-green1 focus:border-pharmacy-green1"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
    </div>
  );
};

export default ProductFilters;
