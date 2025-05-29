import { dashboardService } from './dashboardService';
import { supabase } from '@/lib/supabaseClient'; // Will be mocked

// Mock the Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        gte: jest.fn(() => ({
          // Mock for getDashboardStats - conversations
          select: jest.fn().mockResolvedValueOnce({ data: [{ id: 'conv1' }, { id: 'conv2' }], error: null, count: 2 }), 
        })),
        eq: jest.fn(() => ({
          // Mock for getDashboardStats - clients
           select: jest.fn().mockResolvedValueOnce({ data: [{ id: 'client1' }], error: null, count: 1 }),
        })),
        order: jest.fn(() => ({
          limit: jest.fn().mockResolvedValue({ data: [], error: null }), // Default for reminders initially
        })),
        // Default mock for other selects if not chained with gte/eq etc.
        mockResolvedValue: jest.fn().mockResolvedValue({ data: [], error: null }), 
      })),
    })),
  },
}));

// A helper to reset mocks and provide specific implementations for chained calls
const mockSupabaseQuery = (
  { data = null, error = null, count = null }: { data?: any[] | null, error?: any | null, count?: number | null } = {}
) => {
  const mockImplementation = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    // The final part of the chain that returns data
    // For .select() not followed by .single()
    then: jest.fn((callback) => callback({ data, error, count })),
    // Or more directly for specific cases if `then` is not how it's used.
    // This might need adjustment based on how Supabase client promise resolves.
    // Let's assume select directly can return a promise.
    mockResolvedValue: (value: any) => jest.fn().mockResolvedValue(value),
  };
  
  // Default behavior for select if not further specified by test
  mockImplementation.select = jest.fn().mockResolvedValue({ data, error, count });

  // Specific mocks for chained calls that return `this`
  const chainableMethods = ['select', 'insert', 'update', 'delete', 'eq', 'gte', 'lte', 'order', 'limit'];
  chainableMethods.forEach(methodName => {
    (mockImplementation as any)[methodName] = jest.fn().mockImplementation(() => {
      // When these methods are called, they should return the mockImplementation itself
      // to allow further chaining, and the final call (e.g. another select, or single) 
      // will resolve the value.
      // The actual resolution will be handled by the final method in the chain.
      // For a simple select, it will resolve to the default {data, error, count}
      // For a more complex chain, the specific function (like single) will resolve it.
      return mockImplementation;
    });
  });
  
  // If the call is supabase.from('table').select(...), it should resolve
  (supabase.from as jest.Mock).mockReturnValue(mockImplementation);
  return mockImplementation; // Return for further specific mocking if needed
};


describe('DashboardService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch and return dashboard statistics correctly', async () => {
      // Mock specific query chains for getDashboardStats
      const mockConversations = { data: [{ id: 'c1' }], error: null, count: 10 };
      const mockClients = { data: [{ id: 'cl1' }], error: null, count: 5 };
      // No sales table, so no mock for it needed, service handles it as 0.

      (supabase.from as jest.Mock)
        .mockImplementationOnce((table: string) => { // For 'conversations'
          return {
            select: jest.fn().mockImplementationOnce(() => ({ // head true, count exact
              gte: jest.fn().mockResolvedValueOnce({ count: mockConversations.count, error: null }),
            })),
          };
        })
        .mockImplementationOnce((table: string) => { // For 'clients'
          return {
            select: jest.fn().mockImplementationOnce(() => ({ // head true, count exact
              eq: jest.fn().mockResolvedValueOnce({ count: mockClients.count, error: null }),
            })),
          };
        });
        
      const stats = await dashboardService.getDashboardStats();

      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(supabase.from).toHaveBeenCalledWith('clients');
      
      expect(stats.conversations.total).toBe(10);
      expect(stats.activeClients.total).toBe(5);
      expect(stats.productsSold.total).toBe(0); // Hardcoded to 0 in service
      expect(stats.conversations.period).toBe('Últimas 24 horas');
    });

    it('should return default stats on error', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'conversations') {
          return {
            select: jest.fn().mockImplementationOnce(() => ({
              gte: jest.fn().mockResolvedValueOnce({ error: new Error('DB error') }),
            })),
          };
        }
        // For other tables, return a non-error state or specific error if needed
        return {
          select: jest.fn().mockImplementationOnce(() => ({
            eq: jest.fn().mockResolvedValueOnce({ count: 0, error: null }),
          })),
        };
      });

      const stats = await dashboardService.getDashboardStats();
      expect(stats.conversations.total).toBe(0);
      expect(stats.activeClients.total).toBe(0);
      expect(stats.productsSold.total).toBe(0);
    });
  });

  describe('getUpcomingReminders', () => {
    it('should fetch campaigns and map them to reminders', async () => {
      const mockCampaignData = [
        { id: 'camp1', name: 'Aniversário VIP', scheduled_for: new Date().toISOString(), trigger: 'aniversario', target_audience: {} },
        { id: 'camp2', name: 'Promoção Pós-venda', scheduled_for: new Date().toISOString(), trigger: 'posvenda', target_audience: {} },
        { id: 'camp3', name: 'Recompra Especial', scheduled_for: new Date().toISOString(), trigger: 'recompra_trigger', target_audience: {} },
      ];
      
      // Mock the chain for getUpcomingReminders
      const mockCampaignsQuery = {
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockCampaignData, error: null }),
      };
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return mockCampaignsQuery;
        }
        return {}; // Should not be called for other tables in this test
      });

      const reminders = await dashboardService.getUpcomingReminders();

      expect(supabase.from).toHaveBeenCalledWith('campaigns');
      expect(mockCampaignsQuery.gte).toHaveBeenCalled();
      expect(mockCampaignsQuery.order).toHaveBeenCalledWith('scheduled_for', { ascending: true });
      expect(mockCampaignsQuery.limit).toHaveBeenCalledWith(6);

      expect(reminders.length).toBe(3);
      expect(reminders[0].title).toBe('Aniversário VIP');
      expect(reminders[0].type).toBe('aniversario');
      expect(reminders[0].clientCount).toBe(0); // Placeholder
      expect(reminders[1].title).toBe('Promoção Pós-venda');
      expect(reminders[1].type).toBe('posvenda');
      expect(reminders[2].title).toBe('Recompra Especial');
      expect(reminders[2].type).toBe('recompra'); // Default mapping
    });

    it('should return empty array on error fetching reminders', async () => {
       const mockCampaignsQuery = {
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error on campaigns') }),
      };
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return mockCampaignsQuery;
        }
        return {};
      });
      
      const reminders = await dashboardService.getUpcomingReminders();
      expect(reminders).toEqual([]);
    });
  });
});
