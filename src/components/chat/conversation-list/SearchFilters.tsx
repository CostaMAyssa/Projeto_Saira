
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: 'all' | 'unread';
  setFilterType: (type: 'all' | 'unread') => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType
}) => {
  return (
    <div className="p-4 border-b border-pharmacy-dark2">
      <h2 className="text-lg font-medium mb-3 text-white">Conversas</h2>
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conversa..."
          className="pl-8 bg-pharmacy-dark2 border-pharmacy-green1 focus:border-pharmacy-green2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Badge 
            variant="outline" 
            className={cn(
              "bg-pharmacy-dark2 text-pharmacy-green2 hover:bg-pharmacy-green2 hover:text-white cursor-pointer",
              filterType === 'all' && "bg-pharmacy-green2 text-white"
            )}
            onClick={() => setFilterType('all')}
          >
            Todos
          </Badge>
          <Badge 
            variant="outline" 
            className={cn(
              "bg-pharmacy-dark2 text-pharmacy-green2 hover:bg-pharmacy-green2 hover:text-white cursor-pointer",
              filterType === 'unread' && "bg-pharmacy-green2 text-white"
            )}
            onClick={() => setFilterType('unread')}
          >
            Não lidos
          </Badge>
        </div>
        <button className="flex items-center gap-1 text-pharmacy-green2 text-sm hover:text-pharmacy-accent transition-colors">
          <Filter className="h-3 w-3" />
          Filtros
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
