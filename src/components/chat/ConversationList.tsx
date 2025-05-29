
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchFilters from './conversation-list/SearchFilters';
import ConversationItem from './conversation-list/ConversationItem';
import EmptyState from './conversation-list/EmptyState';
// import { mockConversations } from './mockConversations'; // Will be removed
import { Conversation } from './types';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { useState as reactUseState } from 'react'; // Renamed useState to avoid conflict if any, removed duplicate useEffect

interface ConversationListProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  activeConversation, 
  setActiveConversation 
}) => {
  const [searchTerm, setSearchTerm] = reactUseState('');
  const [filterType, setFilterType] = reactUseState<'all' | 'unread'>('all');
  // Initialize with empty array, will be populated from Supabase
  const [conversations, setConversations] = reactUseState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = reactUseState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          status, 
          started_at,
          clients (
            id,
            name,
            phone
          )
        `)
        // TODO: Add ordering, e.g., by last message time eventually
        // .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        // Handle error appropriately
        return;
      }

      if (data) {
        const fetchedConversations = data.map((conv: any) => ({
          id: conv.id,
          name: conv.clients?.name || 'Unknown Client', // Client name from joined table
          phone: conv.clients?.phone || 'N/A', // Client phone
          lastMessage: 'Last message placeholder...', // Placeholder
          time: new Date(conv.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Use started_at for now
          unread: 0, // Placeholder
          status: 'read', // Placeholder, or map from conv.status if applicable to message status
          tags: [], // Placeholder, or fetch if necessary
        }));
        setConversations(fetchedConversations);
        setFilteredConversations(fetchedConversations); // Initialize filtered list
      }
    };

    fetchConversations();
  }, []);

  // Apply filters when search term or filter type changes
  useEffect(() => {
    let filtered = conversations; // Start with all fetched conversations
    
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
  }, [searchTerm, filterType, conversations]); // Add conversations to dependency array
  
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
