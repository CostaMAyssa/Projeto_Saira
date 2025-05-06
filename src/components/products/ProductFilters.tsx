
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

interface ProductFiltersProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
}

const ProductFilters = ({ activeFilter, setActiveFilter }: ProductFiltersProps) => {
  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const getFilterButtonClass = (filter: string | null) => {
    const baseClass = "text-white font-medium";
    const activeClass = activeFilter === filter ? "opacity-100" : "opacity-80 hover:opacity-100";
    
    if (filter === "Uso Contínuo") {
      return `${baseClass} ${activeClass} bg-blue-600 hover:bg-blue-700`;
    } else if (filter === "Controlado") {
      return `${baseClass} ${activeClass} bg-red-600 hover:bg-red-700`;
    } else if (filter === "Antibiótico") {
      return `${baseClass} ${activeClass} bg-purple-600 hover:bg-purple-700`;
    } else {
      // Default "Todos" button
      return `${baseClass} ${activeClass} bg-gray-600 hover:bg-gray-700`;
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-3 overflow-x-auto pb-2">
        <Button 
          className={getFilterButtonClass(null)}
          onClick={() => setActiveFilter(null)}
        >
          Todos
        </Button>
        <Button 
          className={getFilterButtonClass("Uso Contínuo")}
          onClick={() => handleFilterClick("Uso Contínuo")}
        >
          Uso Contínuo
        </Button>
        <Button 
          className={getFilterButtonClass("Controlado")}
          onClick={() => handleFilterClick("Controlado")}
        >
          Controlados
        </Button>
        <Button 
          className={getFilterButtonClass("Antibiótico")}
          onClick={() => handleFilterClick("Antibiótico")}
        >
          Antibióticos
        </Button>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produto..."
            className="pl-10 pr-4 py-2 border-pharmacy-dark1 rounded-md w-64"
          />
        </div>
        <Button variant="outline" className="border-pharmacy-dark1">
          <Filter className="h-4 w-4 text-pharmacy-dark1" />
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
