
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

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        <Button 
          variant="outline" 
          className={`border-gray-300 ${activeFilter === null ? 'bg-gray-100' : ''}`}
          onClick={() => setActiveFilter(null)}
        >
          Todos
        </Button>
        <Button 
          variant="outline" 
          className={`border-gray-300 ${activeFilter === 'Uso Contínuo' ? 'bg-gray-100' : ''}`}
          onClick={() => handleFilterClick('Uso Contínuo')}
        >
          Uso Contínuo
        </Button>
        <Button 
          variant="outline" 
          className={`border-gray-300 ${activeFilter === 'Controlado' ? 'bg-gray-100' : ''}`}
          onClick={() => handleFilterClick('Controlado')}
        >
          Controlados
        </Button>
        <Button 
          variant="outline" 
          className={`border-gray-300 ${activeFilter === 'Antibiótico' ? 'bg-gray-100' : ''}`}
          onClick={() => handleFilterClick('Antibiótico')}
        >
          Antibióticos
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produto..."
            className="pl-10 pr-4 py-2 border-gray-300 rounded-md w-64"
          />
        </div>
        <Button variant="outline" className="border-gray-300">
          <Filter className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
