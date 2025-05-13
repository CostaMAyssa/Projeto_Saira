
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
        "p-4 hover:bg-pharmacy-whatsapp-hover cursor-pointer border-b border-pharmacy-border1 conversation-item",
        isActive && "bg-pharmacy-whatsapp-hover border-l-4 border-l-pharmacy-whatsapp-primary"
      )}
      onClick={onClick}
      data-conversation-id={conversation.id}
    >
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-pharmacy-whatsapp-primary flex-shrink-0 flex items-center justify-center text-white font-medium">
          {initial}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-pharmacy-text1">{conversation.name}</span>
            <span className="text-xs text-pharmacy-text2">{conversation.time}</span>
          </div>
          
          <div className="flex justify-between items-start">
            <div className="overflow-hidden">
              <p className="text-sm text-pharmacy-text2 truncate pr-2 max-w-[90%] flex items-center gap-1">
                <StatusIcon status={conversation.status} />
                {conversation.lastMessage}
              </p>
              
              <div className="flex gap-1 mt-1 flex-wrap">
                {conversation.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="tag-badge text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {conversation.unread > 0 && (
              <span className="bg-pharmacy-whatsapp-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
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
