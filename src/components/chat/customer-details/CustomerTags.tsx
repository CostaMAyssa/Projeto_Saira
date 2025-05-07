import React, { useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AddTagDialog from './AddTagDialog';

interface CustomerTagsProps {
  tags: string[];
  onAddTag: (tag: string) => void;
}

const CustomerTags: React.FC<CustomerTagsProps> = ({ tags, onAddTag }) => {
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <span className="text-sm text-pharmacy-text1 font-medium">Tags</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="tag-badge"
          >
            {tag}
          </Badge>
        ))}
        <Badge 
          variant="outline" 
          className="bg-pharmacy-light2 border border-pharmacy-border1 text-xs text-pharmacy-text2 hover:text-pharmacy-whatsapp-primary hover:border-pharmacy-whatsapp-primary cursor-pointer"
          onClick={() => setIsAddTagDialogOpen(true)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Nova tag
        </Badge>
      </div>
      
      <AddTagDialog 
        open={isAddTagDialogOpen}
        setOpen={setIsAddTagDialogOpen}
        onAddTag={onAddTag}
      />
    </div>
  );
};

export default CustomerTags;
