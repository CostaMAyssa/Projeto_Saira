
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
  return (
    <div
      className={cn(
        "p-4 hover:bg-pharmacy-dark2 cursor-pointer conversation-item",
        isActive && "active"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between mb-1">
        <span className="font-medium text-white">{conversation.name}</span>
        <span className="text-xs text-muted-foreground">{conversation.time}</span>
      </div>
      
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs text-muted-foreground">{conversation.phone}</span>
      </div>
      
      <div className="flex justify-between items-start">
        <p className="text-sm text-pharmacy-green2 truncate pr-2 max-w-[80%]">
          {conversation.lastMessage}
        </p>
        <div className="flex items-center gap-1">
          <StatusIcon status={conversation.status} />
          {conversation.unread > 0 && (
            <span className="bg-pharmacy-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-1 mt-2">
        {conversation.tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="bg-pharmacy-dark2 border-pharmacy-green1 text-xs text-pharmacy-green2"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ConversationItem;
