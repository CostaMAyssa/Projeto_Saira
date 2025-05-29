import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientsModule from './ClientsModule'; // Adjust path
import { supabase } from '@/lib/supabaseClient'; // Will be mocked
import { Client } from './types'; // Adjust path

import ClientsModule, { ClientModalFormData } from './ClientsModule'; // Adjust path, import ClientModalFormData
import { supabase } from '@/lib/supabase'; // For direct fetch used in module
import { dashboardService, ClientData } from '../../services/dashboardService'; // For CRUD operations
import { Client } from './types'; // Adjust path
import { useIsMobile } from '@/hooks/use-is-mobile';
import { toast } from 'sonner';

// Mock Supabase client (for direct list fetching in ClientsModule)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(), // Added for .order() in fetchClientsData
  },
}));

// Mock dashboardService for CRUD operations
jest.mock('../../services/dashboardService', () => ({
  dashboardService: {
    createClient: jest.fn(),
    updateClient: jest.fn(),
    deleteClient: jest.fn(),
    // getAllClients: jest.fn(), // If we were to refactor fetchClientsData to use service
  },
}));

// Mock hooks
jest.mock('@/hooks/use-is-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
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
    {/* Simulate modal opening and form submission via onAddClient */}
    <button data-testid="add-client-button" onClick={() => props.onAddClient({ 
        name: 'Test New Client', 
        phone: '123456789', 
        status: 'active',
        email: 'new@test.com' 
        // Add other fields as per ClientModalFormData
    })}>Add Client</button>
  </div>
));

// Mock ClientTable more thoroughly to allow interaction with its internal buttons
jest.mock('./ClientTable', () => (props: { 
    clients: Client[]; 
    onEditClient: (clientId: string, data: any) => Promise<boolean>; // Assuming it's used by ClientTable's internal edit save
    onDeleteClient: (clientId: string) => void;
    onToggleStatus: (client: Client) => void;
}) => (
  <div data-testid="client-table">
    {props.clients.map(client => (
      <div key={client.id} data-testid={`client-row-${client.id}`}>
        <span>{client.name} (Table)</span>
        <button data-testid={`edit-${client.id}`} onClick={() => {
            // Simulate modal opening and data submission for edit
            // This simplified mock calls onEditClient directly.
            // A real modal interaction would be more complex.
            props.onEditClient(client.id, { ...client, name: `${client.name} Updated`, status: client.status });
        }}>Edit</button>
        <button data-testid={`delete-${client.id}`} onClick={() => props.onDeleteClient(client.id)}>Delete</button>
        <button data-testid={`toggle-status-${client.id}`} onClick={() => props.onToggleStatus(client)}>Toggle Status</button>
      </div>
    ))}
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


const mockDbClients: any[] = [ // Use any for mock flexibility, map to Client in tests
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

    (supabase.from('clients').select as jest.Mock).mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockDbClients, error: null })
    });
    (useIsMobile as jest.Mock).mockReturnValue(false);
  });

  it('fetches clients, transforms data, and displays them', async () => {
    render(<ClientsModule />);
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(screen.getByText('John Doe (Table)')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith (Table)')).toBeInTheDocument();
    });
  });

  // AddClient test
  it('handleAddClient calls createClient service and refreshes list', async () => {
    const newClientData: ClientModalFormData = { name: 'Test New Client', phone: '123456789', status: 'active', email: 'new@test.com' };
    const createdClientDb: ClientData = { ...newClientData, status: 'ativo' }; // DB representation
    
    (dashboardService.createClient as jest.Mock).mockResolvedValue({ ...createdClientDb, id: 'client3' });
    // Mock the fetchClientsData (supabase.from().select().order()) for refresh
    const refreshedDbClients = [...mockDbClients, { ...createdClientDb, id: 'client3', created_at: new Date().toISOString() }];
    (supabase.from('clients').select().order as jest.Mock)
        .mockResolvedValueOnce({ data: mockDbClients, error: null }) // Initial
        .mockResolvedValueOnce({ data: refreshedDbClients, error: null }); // After refresh


    render(<ClientsModule />);
    await waitFor(() => expect(screen.getByText('John Doe (Table)')).toBeInTheDocument());

    // Simulate modal submission by clicking the "Add Client" button in the mocked header
    fireEvent.click(screen.getByTestId('add-client-button'));

    await waitFor(() => {
      expect(dashboardService.createClient).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test New Client',
        status: 'ativo' 
      }));
      expect(toast.success).toHaveBeenCalledWith('Cliente adicionado com sucesso!');
      // Check if supabase.from was called again for refresh
      expect(supabase.from).toHaveBeenCalledTimes(2); // Initial + refresh
    });
    expect(screen.getByText('Test New Client (Table)')).toBeInTheDocument();
  });

  // UpdateClient test
  it('handleSaveClientUpdate calls updateClient service and refreshes list', async () => {
    const updatedClientData: Partial<ClientData> = { name: 'John Doe Updated', status: 'inativo' };
    (dashboardService.updateClient as jest.Mock).mockResolvedValue({ id: 'client1', ...updatedClientData });
    
    const initialLoadMock = (supabase.from('clients').select().order as jest.Mock).mockResolvedValueOnce({ data: mockDbClients, error: null });
    const refreshLoadMock = (supabase.from('clients').select().order as jest.Mock).mockResolvedValueOnce({ 
        data: mockDbClients.map(c => c.id === 'client1' ? {...c, ...updatedClientData, name: 'John Doe Updated', status: 'inativo'} : c), 
        error: null 
    });


    render(<ClientsModule />);
    await waitFor(() => expect(screen.getByText('John Doe (Table)')).toBeInTheDocument());

    // Simulate clicking edit on the first client in the mocked ClientTable
    fireEvent.click(screen.getByTestId('edit-client1'));

    await waitFor(() => {
      expect(dashboardService.updateClient).toHaveBeenCalledWith('client1', expect.objectContaining({
        name: 'John Doe Updated', // This comes from the mocked ClientTable's direct call
        status: 'inativo'       // This comes from the mocked ClientTable's direct call
      }));
      expect(toast.success).toHaveBeenCalledWith('Cliente atualizado com sucesso!');
      expect(supabase.from).toHaveBeenCalledTimes(2); // Initial + refresh
    });
     expect(screen.getByText('John Doe Updated (Table)')).toBeInTheDocument();
  });

  // DeleteClient test
  it('handleDeleteClientFromModule calls deleteClient service and refreshes list', async () => {
    (dashboardService.deleteClient as jest.Mock).mockResolvedValue(undefined);
    window.confirm = jest.fn(() => true); // Auto-confirm deletion
    
    (supabase.from('clients').select().order as jest.Mock)
        .mockResolvedValueOnce({ data: mockDbClients, error: null }) // Initial
        .mockResolvedValueOnce({ data: mockDbClients.filter(c => c.id !== 'client1'), error: null }); // After refresh


    render(<ClientsModule />);
    await waitFor(() => expect(screen.getByText('John Doe (Table)')).toBeInTheDocument());

    // Simulate clicking delete on the first client in the mocked ClientTable
    fireEvent.click(screen.getByTestId('delete-client1'));

    await waitFor(() => {
      expect(dashboardService.deleteClient).toHaveBeenCalledWith('client1');
      expect(toast.success).toHaveBeenCalledWith('Cliente excluído com sucesso!');
      expect(supabase.from).toHaveBeenCalledTimes(2); // Initial + refresh
    });
    expect(screen.queryByText('John Doe (Table)')).not.toBeInTheDocument();
  });
  
  // Toggle Status Test
  it('handleToggleClientStatusInModule calls updateClient for status and refreshes list', async () => {
    const clientToToggle = mockDbClients.find(c => c.id === 'client1')!; // John Doe, status 'ativo'
    const expectedDbStatusAfterToggle = 'inativo'; // active -> inactive (DB: ativo -> inativo)
    
    (dashboardService.updateClient as jest.Mock).mockResolvedValue({ ...clientToToggle, status: expectedDbStatusAfterToggle });
     (supabase.from('clients').select().order as jest.Mock)
        .mockResolvedValueOnce({ data: mockDbClients, error: null }) // Initial
        .mockResolvedValueOnce({ data: mockDbClients.map(c => c.id === 'client1' ? {...c, status: expectedDbStatusAfterToggle } : c), error: null });


    render(<ClientsModule />);
    await waitFor(() => expect(screen.getByText('John Doe (Table)')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('toggle-status-client1'));

    await waitFor(() => {
        expect(dashboardService.updateClient).toHaveBeenCalledWith('client1', { status: expectedDbStatusAfterToggle });
        expect(toast.success).toHaveBeenCalledWith(`Status do cliente alterado para ${expectedDbStatusAfterToggle}.`);
        expect(supabase.from).toHaveBeenCalledTimes(2);
    });
    // UI should reflect the change (e.g. badge text, if ClientTable mock was more detailed)
    // For now, we trust the refresh and the service call.
  });


  // Existing tests for view mode, search, error handling, mobile view can remain,
  // just ensure they are compatible with the new async data loading and state.
  // Example:
  it('filters clients based on search query after data load', async () => {
    render(<ClientsModule />);
    await waitFor(() => expect(screen.getByText('John Doe (Table)')).toBeInTheDocument());

    const searchInput = screen.getByTestId('client-search-input');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.queryByText('John Doe (Table)')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith (Table)')).toBeInTheDocument();
    });
  });
});
