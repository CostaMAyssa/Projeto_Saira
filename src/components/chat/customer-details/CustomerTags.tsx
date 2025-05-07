
import React from 'react';
import { Tag, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerTagsProps {
  tags: string[];
}

const CustomerTags: React.FC<CustomerTagsProps> = ({ tags }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="h-4 w-4 text-pharmacy-green2" />
        <span className="text-sm text-white">Tags</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="bg-pharmacy-dark2 border-pharmacy-green1 text-xs text-pharmacy-green2"
          >
            {tag}
          </Badge>
        ))}
        <Badge 
          variant="outline" 
          className="bg-pharmacy-dark2 border-pharmacy-green1 text-xs text-pharmacy-green2 cursor-pointer"
        >
          <Plus className="h-3 w-3 mr-1" />
          Nova tag
        </Badge>
      </div>
    </div>
  );
};

export default CustomerTags;
