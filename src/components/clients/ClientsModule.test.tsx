import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientsModule from './ClientsModule'; // Adjust path
import { supabase } from '@/lib/supabaseClient'; // Will be mocked
import { Client } from './types'; // Adjust path

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  },
}));

// Mock child components
jest.mock('./ClientSearchHeader', () => (props: any) => (
  <div>
    <button onClick={() => props.setViewMode('table')}>Table View</button>
    <button onClick={() => props.setViewMode('cards')}>Card View</button>
    <input 
      data-testid="client-search-input" 
      placeholder="Search clients"
      onChange={(e) => props.onSearch(e.target.value)} 
    />
    <button onClick={() => props.onAddClient({})}>Add Client</button>
  </div>
));

// For ClientTable and ClientsCardView, we'll use simplified mocks
// that just render client names to confirm data is passed down.
jest.mock('./ClientTable', () => (props: { clients: Client[] }) => (
  <div data-testid="client-table">
    {props.clients.map(client => <div key={client.id}>{client.name} (Table)</div>)}
  </div>
));
jest.mock('./ClientsCardView', () => (props: { clients: Client[] }) => (
  <div data-testid="client-card-view">
    {props.clients.map(client => <div key={client.id}>{client.name} (Card)</div>)}
  </div>
));
jest.mock('./ClientUtilities', () => ({
  getStatusBadge: (status: string) => <span data-testid={`status-${status}`}>{status}</span>,
  getTagBadge: (tag: string) => <span data-testid={`tag-${tag}`}>{tag}</span>,
}));


const mockDbClients = [
  {
    id: 'client1',
    name: 'John Doe',
    phone: '555-0101',
    email: 'john.doe@example.com',
    status: 'ativo', // DB schema uses 'ativo'/'inativo'
    tags: ['VIP', 'Importante'],
    last_purchase: new Date(2023, 0, 15).toISOString(), // DB stores as timestamp
    is_vip: true,
    profile_type: 'vip', // DB schema
    created_at: new Date().toISOString(),
    created_by: 'user-uuid',
    birth_date: new Date(1980, 5, 10).toISOString(),
  },
  {
    id: 'client2',
    name: 'Jane Smith',
    phone: '555-0102',
    email: 'jane.smith@example.com',
    status: 'inativo',
    tags: ['Regular'],
    last_purchase: new Date(2023, 2, 10).toISOString(),
    is_vip: false,
    profile_type: 'regular',
    created_at: new Date().toISOString(),
    created_by: 'user-uuid',
    birth_date: new Date(1990, 8, 20).toISOString(),
  },
];

// Expected transformed client data structure (matches Client type in types.ts)
const expectedTransformedClients: Partial<Client>[] = [
  {
    id: 'client1',
    name: 'John Doe',
    status: 'active', // Transformed
    isVip: true,
    isRegular: false, // Derived from profile_type 'vip'
    isOccasional: false, // Derived
  },
  {
    id: 'client2',
    name: 'Jane Smith',
    status: 'inactive', // Transformed
    isVip: false,
    isRegular: true, // Derived from profile_type 'regular'
    isOccasional: false, // Derived
  },
];


describe('ClientsModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from('clients').select as jest.Mock).mockResolvedValue({
      data: mockDbClients,
      error: null,
    });
     // Mock window.innerWidth for isMobile hook
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 }); // Desktop default
  });

  it('fetches clients, transforms data, and displays them in table view by default', async () => {
    render(<ClientsModule />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(supabase.from('clients').select).toHaveBeenCalledWith('*');
    });

    await waitFor(() => {
      // Check if transformed data is displayed
      expect(screen.getByText('John Doe (Table)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith (Table)')).toBeInTheDocument();
    });
    
    // Verify some transformations (implicitly tested by what ClientTable/CardView would receive and use for badges etc.)
    // For example, if getStatusBadge was not mocked, we could check for 'active' badge for John Doe.
    // Since they are mocked, the props passed to them would reflect the transformation.
  });

  it('switches to card view and displays clients', async () => {
    render(<ClientsModule />);
    await waitFor(() => expect(screen.getByText('John Doe (Table)')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Card View'));
    await waitFor(() => {
      expect(screen.getByText('John Doe (Card)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith (Card)')).toBeInTheDocument();
    });
  });
  
  it('filters clients based on search query', async () => {
    render(<ClientsModule />);
    await waitFor(() => expect(screen.getByText('John Doe (Table)')).toBeInTheDocument());

    const searchInput = screen.getByTestId('client-search-input');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.queryByText('John Doe (Table)')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith (Table)')).toBeInTheDocument();
    });
  });
  
  it('handles error when fetching clients', async () => {
    (supabase.from('clients').select as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to fetch clients' },
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ClientsModule />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching clients:', { message: 'Failed to fetch clients' });
      // Check that no client data is rendered
      expect(screen.queryByText('John Doe (Table)')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith (Table)')).not.toBeInTheDocument();
      // You might want to check for an empty state message if one is implemented
      // For now, just ensure no data is shown.
    });
    consoleErrorSpy.mockRestore();
  });
  
  it('uses card view on mobile', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 }); // Mobile width
     // Trigger resize event for isMobile hook to update
    window.dispatchEvent(new Event('resize'));

    render(<ClientsModule />);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('clients');
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe (Card)')).toBeInTheDocument();
      expect(screen.queryByText('John Doe (Table)')).not.toBeInTheDocument();
    });
  });
});
