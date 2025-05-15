
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchFilters from './conversation-list/SearchFilters';
import ConversationItem from './conversation-list/ConversationItem';
import EmptyState from './conversation-list/EmptyState';
import { mockConversations } from './mockConversations';
import { Conversation } from './types';

interface ConversationListProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  activeConversation, 
  setActiveConversation 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(mockConversations);

  // Apply filters when search term or filter type changes
  useEffect(() => {
    let filtered = mockConversations;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        convo => 
          convo.name.toLowerCase().includes(term) || 
          convo.phone.toLowerCase().includes(term)
      );
    }
    
    // Apply read/unread filter
    if (filterType === 'unread') {
      filtered = filtered.filter(convo => convo.unread > 0);
    }
    
    setFilteredConversations(filtered);
  }, [searchTerm, filterType]);
  
  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col font-sans">
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
      />
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="pb-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation === conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
