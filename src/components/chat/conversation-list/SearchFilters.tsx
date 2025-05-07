import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    <div className="p-4 border-b border-pharmacy-border1 bg-pharmacy-whatsapp-header">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium text-pharmacy-text1">Conversas</h2>
        <Button variant="ghost" size="icon" className="text-pharmacy-whatsapp-icon hover:bg-gray-200 rounded-full h-8 w-8">
          <MoreVertical size={18} />
        </Button>
      </div>
      
      <div className="relative mb-3">
        <div className="relative flex items-center">
          <Input
            placeholder="Buscar conversa..."
            className="pl-10 bg-white rounded-full border-pharmacy-border1 focus-visible:ring-0 focus-visible:border-pharmacy-border1 text-pharmacy-text1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-pharmacy-text2" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={cn(
            "bg-white text-pharmacy-text2 hover:bg-pharmacy-whatsapp-primary hover:text-white cursor-pointer border-pharmacy-border1",
            filterType === 'all' && "bg-pharmacy-whatsapp-primary text-white border-pharmacy-whatsapp-primary"
          )}
          onClick={() => setFilterType('all')}
        >
          Todos
        </Badge>
        <Badge 
          variant="outline" 
          className={cn(
            "bg-white text-pharmacy-text2 hover:bg-pharmacy-whatsapp-primary hover:text-white cursor-pointer border-pharmacy-border1",
            filterType === 'unread' && "bg-pharmacy-whatsapp-primary text-white border-pharmacy-whatsapp-primary"
          )}
          onClick={() => setFilterType('unread')}
        >
          Não lidos
        </Badge>
      </div>
    </div>
  );
};

export default SearchFilters;
