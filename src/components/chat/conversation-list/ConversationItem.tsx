
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import StatusIcon from './StatusIcon';
import { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick
}) => {
  const initial = conversation.name.charAt(0).toUpperCase();
  
  return (
    <div
      className={cn(
        "p-4 hover:bg-[#F5F6F6] cursor-pointer border-b border-gray-200",
        isActive && "bg-[#F0F2F5]"
      )}
      onClick={onClick}
      data-conversation-id={conversation.id}
    >
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-[#DFE5E7] flex-shrink-0 flex items-center justify-center text-gray-600 font-medium">
          {initial}
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-900 max-w-[120px] truncate block">{conversation.name}</span>
            <span className="text-xs text-gray-500 max-w-[60px] truncate block">{conversation.time}</span>
          </div>
          
          <div className="flex justify-between items-start">
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600 truncate pr-2 max-w-[160px] flex items-center gap-1">
                <StatusIcon status={conversation.status} />
                <span className="truncate max-w-[120px] block">{conversation.lastMessage}</span>
              </p>
              
              <div className="flex gap-1 mt-1 flex-wrap">
                {conversation.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs bg-[#F0F2F5] border-gray-200 text-gray-600"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {conversation.unread > 0 && (
              <span className="bg-[#25D366] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                {conversation.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
