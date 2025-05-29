import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversationList from './ConversationList'; // Adjust path as necessary
import { supabase } from '@/lib/supabaseClient'; // Will be mocked
import { Conversation } from './types'; // Adjust path as necessary

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  },
}));

// Mock child components to simplify testing focus on ConversationList logic
jest.mock('./conversation-list/SearchFilters', () => (props: any) => (
  <div>
    <input
      data-testid="search-input"
      placeholder="Search conversations..."
      value={props.searchTerm}
      onChange={(e) => props.setSearchTerm(e.target.value)}
    />
    {/* Add filter type buttons if their interaction is crucial for ConversationList state */}
  </div>
));

jest.mock('./conversation-list/ConversationItem', () => (props: { conversation: Conversation, isActive: boolean, onClick: () => void }) => (
  <div data-testid={`conversation-item-${props.conversation.id}`} onClick={props.onClick}>
    <div>{props.conversation.name}</div>
    <div>{props.conversation.phone}</div>
    <div data-testid={`conversation-lastMessage-${props.conversation.id}`}>{props.conversation.lastMessage}</div>
  </div>
));

jest.mock('./conversation-list/EmptyState', () => () => <div data-testid="empty-state">No conversations</div>);

const mockConversationsData = [
  {
    id: 'conv1',
    status: 'active', // This is 'conversation_status' from DB
    started_at: new Date().toISOString(),
    clients: { id: 'client1', name: 'Alice Wonderland', phone: '123-456-7890' },
  },
  {
    id: 'conv2',
    status: 'active',
    started_at: new Date().toISOString(),
    clients: { id: 'client2', name: 'Bob The Builder', phone: '987-654-3210' },
  },
];

describe('ConversationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful mock for fetching conversations
    (supabase.from('conversations').select().order as jest.Mock).mockResolvedValue({
      data: mockConversationsData,
      error: null,
    });
  });

  it('fetches and displays conversations', async () => {
    render(<ConversationList activeConversation={null} setActiveConversation={jest.fn()} />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(supabase.from('conversations').select).toHaveBeenCalledWith(expect.stringContaining('clients'));
      expect(supabase.from('conversations').select().order).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-lastMessage-conv1')).toHaveTextContent('Last message placeholder...');
      
      expect(screen.getByText('Bob The Builder')).toBeInTheDocument();
      expect(screen.getByText('987-654-3210')).toBeInTheDocument();
    });
  });

  it('filters conversations based on search term', async () => {
    render(<ConversationList activeConversation={null} setActiveConversation={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
      expect(screen.queryByText('Bob The Builder')).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    await waitFor(() => {
      expect(screen.queryByText('Alice Wonderland')).not.toBeInTheDocument();
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('calls setActiveConversation when a conversation item is clicked', async () => {
    const setActiveConversationMock = jest.fn();
    render(<ConversationList activeConversation={null} setActiveConversation={setActiveConversationMock} />);

    await waitFor(() => {
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('conversation-item-conv1'));
    await waitFor(() => {
      expect(setActiveConversationMock).toHaveBeenCalledWith('conv1');
    });
  });
  
  it('handles error when fetching conversations', async () => {
    (supabase.from('conversations').select().order as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to fetch' },
    });
    
    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ConversationList activeConversation={null} setActiveConversation={jest.fn()} />);

    await waitFor(() => {
      // Check that an error was logged (optional, but good practice)
      expect(console.error).toHaveBeenCalledWith('Error fetching conversations:', { message: 'Failed to fetch' });
      // Check that UI shows empty state or relevant error message
      expect(screen.getByTestId('empty-state')).toBeInTheDocument(); // Assuming empty state is shown on error
    });
    
    consoleErrorSpy.mockRestore();
  });
});
