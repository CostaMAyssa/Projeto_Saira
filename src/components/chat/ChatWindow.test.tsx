import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from './ChatWindow'; // Adjust path as necessary
import { supabase } from '@/lib/supabaseClient'; // Will be mocked
import { Message } from './types'; // Adjust path as necessary

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  },
}));

// Mock child components
jest.mock('./chat-window/ChatHeader', () => (props: any) => <div data-testid="chat-header">Header for {props.activeConversation}</div>);
jest.mock('./chat-window/MessageList', () => (props: { messages: Message[] }) => (
  <div data-testid="message-list">
    {props.messages.map(msg => (
      <div key={msg.id} data-testid={`message-${msg.id}`}>
        <span>{msg.sender}: {msg.content} ({msg.timestamp})</span>
      </div>
    ))}
  </div>
));
jest.mock('./chat-window/MessageInput', () => (props: any) => <div data-testid="message-input">Input</div>);
jest.mock('./chat-window/EmptyState', () => () => <div data-testid="empty-chat-state">Select a conversation</div>);

const mockMessagesData = (conversationId: string): any[] => [
  { 
    id: 'msg1', 
    conversation_id: conversationId, 
    content: 'Hello from client', 
    sender: 'client', // as per DB schema
    sent_at: new Date(2023, 0, 1, 10, 30, 0).toISOString(), // '2023-01-01T10:30:00.000Z'
  },
  { 
    id: 'msg2', 
    conversation_id: conversationId, 
    content: 'Hi, this is pharmacy', 
    sender: 'user', // as per DB schema, maps to 'pharmacy'
    sent_at: new Date(2023, 0, 1, 10, 31, 0).toISOString(), 
  },
];

describe('ChatWindow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays empty state when no active conversation is selected', () => {
    render(<ChatWindow activeConversation={null} isMobile={false} />);
    expect(screen.getByTestId('empty-chat-state')).toBeInTheDocument();
  });

  it('fetches and displays messages for an active conversation', async () => {
    const activeConvId = 'conv123';
    (supabase.from('messages').select().eq().order as jest.Mock).mockResolvedValue({
      data: mockMessagesData(activeConvId),
      error: null,
    });

    render(<ChatWindow activeConversation={activeConvId} isMobile={false} />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.from('messages').select).toHaveBeenCalledWith('*');
      expect(supabase.from('messages').select().eq).toHaveBeenCalledWith('conversation_id', activeConvId);
      expect(supabase.from('messages').select().eq().order).toHaveBeenCalledWith('sent_at', { ascending: true });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-header')).toHaveTextContent(`Header for ${activeConvId}`);
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      
      // Check first message (client)
      const msg1 = screen.getByTestId('message-msg1');
      expect(msg1).toHaveTextContent('client: Hello from client');
      expect(msg1).toHaveTextContent('10:30'); // Check formatted time

      // Check second message (pharmacy, mapped from 'user')
      const msg2 = screen.getByTestId('message-msg2');
      expect(msg2).toHaveTextContent('pharmacy: Hi, this is pharmacy');
      expect(msg2).toHaveTextContent('10:31'); // Check formatted time
    });
  });

  it('displays an empty message list if fetching messages returns empty data', async () => {
    const activeConvId = 'conv-empty';
    (supabase.from('messages').select().eq().order as jest.Mock).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<ChatWindow activeConversation={activeConvId} isMobile={false} />);
    
    await waitFor(() => {
      const messageList = screen.getByTestId('message-list');
      // Check that no message items are rendered.
      // queryByTestId will return null if not found.
      expect(screen.queryByTestId('message-msg1')).not.toBeInTheDocument();
      expect(messageList.children.length).toBe(0); // No messages rendered
    });
  });

  it('handles error when fetching messages', async () => {
    const activeConvId = 'conv-error';
    (supabase.from('messages').select().eq().order as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch messages' },
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ChatWindow activeConversation={activeConvId} isMobile={false} />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching messages:', { message: 'Failed to fetch messages' });
      // Ensure it doesn't crash and MessageList is present (but empty)
      const messageList = screen.getByTestId('message-list');
      expect(messageList.children.length).toBe(0);
    });
    
    consoleErrorSpy.mockRestore();
  });
});
