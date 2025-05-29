import { dashboardService, getForms } from './dashboardService'; // Import getForms separately if needed
import { supabase } from '@/lib/supabase'; // Use the correct import path for supabase

// Mock the Supabase client from the correct path
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(), // Main `from` is a simple jest.fn()
    // rpc: jest.fn(), // if you use rpc calls
  },
}));

// Helper to create a consistent mock structure for chained calls
const mockSupabaseChain = (returnData: any = { data: null, error: null, count: null }) => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(returnData.data ? { data: returnData.data, error: returnData.error } : { data: null, error: returnData.error }),
    // For calls that don't end with .single() but resolve a list (e.g., select())
    // or for count calls
    then: (callback: Function) => Promise.resolve(callback(returnData)), // Simplified promise resolution
  };
  // Ensure `select` itself can resolve if it's the last in a chain for list/count
  (chain.select as jest.Mock).mockImplementation((query, options) => {
    if (options?.count === 'exact' && options?.head === true) {
      return Promise.resolve({ count: returnData.count, error: returnData.error, data: null });
    }
    return Promise.resolve({ data: returnData.data, error: returnData.error, count: returnData.count });
  });
  return chain;
};


describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for supabase.from, can be overridden in tests
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain());
  });

  describe('getDashboardStats', () => {
    it('should fetch and return dashboard statistics with "N/A" for change', async () => {
      const mockConversationCount = 10;
      const mockClientCount = 5;

      (supabase.from as jest.Mock)
        .mockImplementation((tableName: string) => {
          if (tableName === 'conversations') {
            return mockSupabaseChain({ count: mockConversationCount });
          }
          if (tableName === 'clients') {
            return mockSupabaseChain({ count: mockClientCount });
          }
          return mockSupabaseChain(); // Default for any other table
        });
        
      const stats = await dashboardService.getDashboardStats();

      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(supabase.from).toHaveBeenCalledWith('clients');
      
      expect(stats.conversations.total).toBe(mockConversationCount);
      expect(stats.conversations.change).toBe("N/A");
      expect(stats.activeClients.total).toBe(mockClientCount);
      expect(stats.activeClients.change).toBe("N/A");
      expect(stats.productsSold.total).toBe(0); // Hardcoded to 0
      expect(stats.productsSold.change).toBe("N/A");
    });

    it('should return default stats with "N/A" on error', async () => {
      (supabase.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'conversations') {
          return mockSupabaseChain({ error: new Error('DB error') });
        }
        return mockSupabaseChain({ count: 0 }); // No error for other parts
      });

      const stats = await dashboardService.getDashboardStats();
      expect(stats.conversations.total).toBe(0);
      expect(stats.conversations.change).toBe("N/A");
      expect(stats.activeClients.total).toBe(0);
      expect(stats.activeClients.change).toBe("N/A");
      expect(stats.productsSold.total).toBe(0);
      expect(stats.productsSold.change).toBe("N/A");
    });
  });

  describe('getDailyConversations', () => {
    it('should return transformed daily conversation data', async () => {
      const mockViewData = [{ day_name: 'Mon', conversation_count: 5 }];
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockViewData }));
      
      const result = await dashboardService.getDailyConversations();
      expect(result).toEqual([{ name: 'Mon', value: 5 }]);
      expect(supabase.from).toHaveBeenCalledWith('daily_conversations_view');
    });

    it('should return empty array if daily conversation view fetch fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('View error') }));
      const result = await dashboardService.getDailyConversations();
      expect(result).toEqual([]);
    });
  });

  describe('getMonthlyConversations', () => {
    it('should return transformed monthly conversation data', async () => {
      const mockViewData = [{ month_name: 'Jan', conversation_count: 100 }];
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockViewData }));

      const result = await dashboardService.getMonthlyConversations();
      expect(result).toEqual([{ name: 'Jan', value: 100 }]);
      expect(supabase.from).toHaveBeenCalledWith('monthly_conversations_view');
    });

    it('should return empty array if monthly conversation view fetch fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('View error') }));
      const result = await dashboardService.getMonthlyConversations();
      expect(result).toEqual([]);
    });
  });
  
  // --- Tests for New Report Functions ---
  describe('getReportStats', () => {
    it('should return placeholder report stats', async () => {
      const stats = await dashboardService.getReportStats();
      expect(stats).toEqual({
        responseRate: "N/A (placeholder)",
        avgResponseTime: "N/A (placeholder)",
        conversionRate: "N/A (placeholder)",
      });
    });
  });

  describe('getMessagesByType', () => {
    it('should fetch messages and aggregate counts by type', async () => {
      const mockMessages = [
        { type: 'text' }, { type: 'text' }, { type: 'image' }, { type: 'text' }, { type: 'file' }
      ];
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockMessages }));
      
      const result = await dashboardService.getMessagesByType();
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(result).toContainEqual({ name: 'text', value: 3 });
      expect(result).toContainEqual({ name: 'image', value: 1 });
      expect(result).toContainEqual({ name: 'file', value: 1 });
    });
     it('should return empty array if fetching messages by type fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('DB error') }));
      const result = await dashboardService.getMessagesByType();
      expect(result).toEqual([]);
    });
  });

  describe('getClientsServedLastWeek', () => {
    it('should fetch conversations and aggregate unique clients per day for the last 7 days', async () => {
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
      
      const mockConversations = [
        { client_id: 'c1', started_at: today.toISOString() },
        { client_id: 'c2', started_at: today.toISOString() },
        { client_id: 'c1', started_at: yesterday.toISOString() },
        { client_id: 'c3', started_at: twoDaysAgo.toISOString() },
      ];
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockConversations }));
      
      const result = await dashboardService.getClientsServedLastWeek();
      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(result.length).toBe(7); // Should have 7 days

      const todayDayStr = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(today).replace('.', '');
      const yesterdayDayStr = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(yesterday).replace('.', '');
      const twoDaysAgoDayStr = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(twoDaysAgo).replace('.', '');

      expect(result.find(d => d.name.toLowerCase() === todayDayStr.toLowerCase())?.value).toBe(2);
      expect(result.find(d => d.name.toLowerCase() === yesterdayDayStr.toLowerCase())?.value).toBe(1);
      expect(result.find(d => d.name.toLowerCase() === twoDaysAgoDayStr.toLowerCase())?.value).toBe(1);
    });
     it('should return an array of 7 days with 0 counts if fetching clients served fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('DB error') }));
      const result = await dashboardService.getClientsServedLastWeek();
      expect(result.length).toBe(7); // Still returns 7 days structure
      result.forEach(day => expect(day.value).toBe(0)); // All values should be 0
    });
  });

  describe('getProductCategoryDistribution', () => {
    it('should fetch products and aggregate counts by category', async () => {
      const mockProducts = [
        { category: 'A' }, { category: 'B' }, { category: 'A' }, { category: 'C' }, { category: 'B' }, { category: 'A' }
      ];
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockProducts }));
      
      const result = await dashboardService.getProductCategoryDistribution();
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(result).toContainEqual({ name: 'A', value: 3 });
      expect(result).toContainEqual({ name: 'B', value: 2 });
      expect(result).toContainEqual({ name: 'C', value: 1 });
    });
    it('should return empty array if fetching product categories fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('DB error') }));
      const result = await dashboardService.getProductCategoryDistribution();
      expect(result).toEqual([]);
    });
  });

  describe('getCampaignReportData', () => {
    it('should fetch campaigns and their execution summaries', async () => {
      const mockCampaigns = [{ id: 'camp1', name: 'Campaign Alpha' }];
      const mockExecutionsCamp1 = [{ messages_sent: 100 }, { messages_sent: 50 }];
      
      (supabase.from as jest.Mock)
        .mockImplementationOnce((tableName: string) => { // For 'campaigns'
          return mockSupabaseChain({ data: mockCampaigns });
        })
        .mockImplementationOnce((tableName: string) => { // For 'campaign_executions' for camp1
          return mockSupabaseChain({ data: mockExecutionsCamp1 });
        });
        
      const result = await dashboardService.getCampaignReportData();
      expect(supabase.from).toHaveBeenCalledWith('campaigns');
      expect(supabase.from).toHaveBeenCalledWith('campaign_executions');
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ name: 'Campaign Alpha', sent: 150, responses: 'N/A', rate: 'N/A' });
    });
     it('should return empty array if fetching campaigns fails', async () => {
      (supabase.from as jest.Mock).mockImplementation((tableName: string) => {
          if (tableName === 'campaigns') return mockSupabaseChain({ error: new Error('DB error') });
          return mockSupabaseChain();
      });
      const result = await dashboardService.getCampaignReportData();
      expect(result).toEqual([]);
    });
  });

  // --- Tests for Campaign Module Function ---
  describe('getAllCampaignsDetails', () => {
    it('should fetch campaigns, map data, and get last run info', async () => {
      const mockCampaigns = [
        { id: 'c1', name: 'Aniversariantes', trigger: 'aniversario', status: 'ativa', target_audience: { tag: 'vip' }, scheduled_for: null },
        { id: 'c2', name: 'Black Friday', trigger: 'manual', status: 'pausada', target_audience: null, scheduled_for: new Date().toISOString() },
      ];
      const mockExecutionsC1 = [{ executed_at: new Date(2023, 0, 15, 10, 0, 0).toISOString() }];
      // No executions for c2

      (supabase.from as jest.Mock)
        .mockImplementation((tableName: string) => {
          if (tableName === 'campaigns') {
            return mockSupabaseChain({ data: mockCampaigns });
          }
          if (tableName === 'campaign_executions') {
            // This mock needs to be smarter based on .eq()
            // For simplicity here, we'll assume the first call is for c1, second for c2
            const currentFrom = (supabase.from as jest.Mock);
            if (currentFrom.mock.calls.some(call => call[0] === 'campaign_executions' && currentFrom.mock.calls[currentFrom.mock.calls.length-1][1]?.eq?.mock.calls[0][1] === 'c1')) {
                 return mockSupabaseChain({ data: mockExecutionsC1 });
            }
            return mockSupabaseChain({ data: [] }); // For c2
          }
          return mockSupabaseChain();
        });
      
      // More refined mocking for specific .eq calls
      const campaignExecChain = mockSupabaseChain();
      (supabase.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'campaigns') return mockSupabaseChain({ data: mockCampaigns });
        if (tableName === 'campaign_executions') return campaignExecChain;
        return mockSupabaseChain();
      });
      (campaignExecChain.eq as jest.Mock).mockImplementation((field, value) => {
        if (value === 'c1') return mockSupabaseChain({ data: mockExecutionsC1 });
        if (value === 'c2') return mockSupabaseChain({ data: [] }); // No executions for c2
        return mockSupabaseChain();
      });


      const result = await dashboardService.getAllCampaignsDetails();
      
      expect(supabase.from).toHaveBeenCalledWith('campaigns');
      expect(supabase.from).toHaveBeenCalledWith('campaign_executions'); // Called twice
      expect(result.length).toBe(2);
      
      expect(result[0].name).toBe('Aniversariantes');
      expect(result[0].type).toBe('Aniversário');
      expect(result[0].status).toBe('active');
      expect(result[0].audience).toContain('tag: "vip"');
      expect(result[0].lastRun).toBe('15/01/2023 10:00'); 
      expect(result[0].schedule).toBe('Aniversário (automático)');

      expect(result[1].name).toBe('Black Friday');
      expect(result[1].type).toBe('Manual');
      expect(result[1].status).toBe('paused');
      expect(result[1].audience).toBe('Não definido');
      expect(result[1].lastRun).toBe('Nunca executado');
      expect(result[1].schedule).toContain('Agendado para');
    });
    it('should return empty array if fetching campaign details fails', async () => {
      (supabase.from as jest.Mock).mockImplementation((tableName: string) => {
          if (tableName === 'campaigns') return mockSupabaseChain({ error: new Error('DB error') });
          return mockSupabaseChain();
      });
      const result = await dashboardService.getAllCampaignsDetails();
      expect(result).toEqual([]);
    });
  });

  // Tests for getForms (exported separately)
  describe('getForms', () => {
    it('should fetch forms with response counts', async () => {
      const mockFormData = [
        { id: 'form1', title: 'Test Form 1', created_at: new Date().toISOString(), question_count: 5, status: 'ativo', form_responses: [{ count: 10 }] },
        { id: 'form2', title: 'Test Form 2', created_at: new Date().toISOString(), question_count: 3, status: 'inativo', form_responses: [{ count: 0 }] },
      ];
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockFormData }));

      const result = await getForms();
      expect(supabase.from).toHaveBeenCalledWith('forms');
      // The select call is complex due to the join for count.
      // We verify the structure of the returned data.
      expect(result?.length).toBe(2);
      expect(result?.[0].title).toBe('Test Form 1');
      expect(result?.[0].form_responses[0].count).toBe(10);
      expect(result?.[1].form_responses[0].count).toBe(0);
    });
     it('should throw error if fetching forms fails', async () => {
        (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('DB error') }));
        await expect(getForms()).rejects.toThrow('DB error');
    });
  });

  // --- CRUD Tests ---

  // Campaign CRUD
  describe('Campaign CRUD', () => {
    const mockCampaign = { id: 'camp1', name: 'Test Campaign' };
    const newCampaignData = { name: 'New Campaign', trigger: 'manual', status: 'ativa' as 'ativa' };

    it('createCampaign should insert data and return it', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockCampaign }));
      const result = await dashboardService.createCampaign(newCampaignData);
      expect(supabase.from).toHaveBeenCalledWith('campaigns');
      expect((supabase.from('campaigns').insert as jest.Mock).mock.calls[0][0]).toEqual([newCampaignData]);
      expect(result).toEqual(mockCampaign);
    });
     it('createCampaign should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Insert failed') }));
      await expect(dashboardService.createCampaign(newCampaignData)).rejects.toThrow('Insert failed');
    });

    it('updateCampaignStatus should update status and return data', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: { ...mockCampaign, status: 'pausada' } }));
      const result = await dashboardService.updateCampaignStatus('camp1', 'pausada');
      expect(supabase.from).toHaveBeenCalledWith('campaigns');
      expect((supabase.from('campaigns').update as jest.Mock).mock.calls[0][0]).toEqual({ status: 'pausada' });
      expect((supabase.from('campaigns').update({}).eq as jest.Mock).mock.calls[0][0]).toEqual('id');
      expect((supabase.from('campaigns').update({}).eq as jest.Mock).mock.calls[0][1]).toEqual('camp1');
      expect(result.status).toBe('pausada');
    });
    it('updateCampaignStatus should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Update failed') }));
      await expect(dashboardService.updateCampaignStatus('camp1', 'pausada')).rejects.toThrow('Update failed');
    });
  });

  // Form CRUD (assuming createForm, updateForm, deleteForm are standalone, not part of class)
  // If they were part of the class, tests would be similar to Campaign CRUD.
  // For now, these tests will assume the existing structure where these are exported constants.
  // The mock for supabase.from() needs to be flexible for these.
  
  // Client CRUD
  describe('Client CRUD', () => {
    const mockClient = { id: 'client1', name: 'Test Client' };
    const clientData = { name: 'New Client', phone: '123', status: 'ativo' as 'ativo' };
    
    it('createClient should insert data', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockClient }));
      await dashboardService.createClient(clientData);
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect((supabase.from('clients').insert as jest.Mock).mock.calls[0][0]).toEqual([clientData]);
    });
     it('createClient should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Insert failed') }));
      await expect(dashboardService.createClient(clientData)).rejects.toThrow('Insert failed');
    });

    it('updateClient should update data', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: { ...mockClient, name: 'Updated Client' } }));
      await dashboardService.updateClient('client1', { name: 'Updated Client' });
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect((supabase.from('clients').update as jest.Mock).mock.calls[0][0]).toEqual({ name: 'Updated Client' });
      expect((supabase.from('clients').update({}).eq as jest.Mock).mock.calls[0][1]).toEqual('client1');
    });
    it('updateClient should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Update failed') }));
      await expect(dashboardService.updateClient('client1', {})).rejects.toThrow('Update failed');
    });

    it('deleteClient should call delete', async () => {
      const deleteChain = mockSupabaseChain(); // No data expected for delete
      (supabase.from as jest.Mock).mockReturnValue(deleteChain);
      await dashboardService.deleteClient('client1');
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(deleteChain.delete).toHaveBeenCalled();
      expect((deleteChain.delete().eq as jest.Mock).mock.calls[0][1]).toEqual('client1');
    });
     it('deleteClient should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Delete failed') }));
      await expect(dashboardService.deleteClient('client1')).rejects.toThrow('Delete failed');
    });
  });

  // Product CRUD
  describe('Product CRUD', () => {
    const mockProduct = { id: 'prod1', name: 'Test Product' };
    const productData = { name: 'New Product', category: 'Test Category' };

    it('createProduct should insert data', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: mockProduct }));
      await dashboardService.createProduct(productData);
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect((supabase.from('products').insert as jest.Mock).mock.calls[0][0]).toEqual([productData]);
    });
     it('createProduct should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Insert failed') }));
      await expect(dashboardService.createProduct(productData)).rejects.toThrow('Insert failed');
    });

    it('updateProduct should update data', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ data: { ...mockProduct, name: 'Updated Product' } }));
      await dashboardService.updateProduct('prod1', { name: 'Updated Product' });
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect((supabase.from('products').update as jest.Mock).mock.calls[0][0]).toEqual({ name: 'Updated Product' });
      expect((supabase.from('products').update({}).eq as jest.Mock).mock.calls[0][1]).toEqual('prod1');
    });
     it('updateProduct should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Update failed') }));
      await expect(dashboardService.updateProduct('prod1', {})).rejects.toThrow('Update failed');
    });

    it('deleteProduct should call delete', async () => {
      const deleteChain = mockSupabaseChain();
      (supabase.from as jest.Mock).mockReturnValue(deleteChain);
      await dashboardService.deleteProduct('prod1');
      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(deleteChain.delete).toHaveBeenCalled();
      expect((deleteChain.delete().eq as jest.Mock).mock.calls[0][1]).toEqual('prod1');
    });
    it('deleteProduct should throw on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain({ error: new Error('Delete failed') }));
      await expect(dashboardService.deleteProduct('prod1')).rejects.toThrow('Delete failed');
    });
  });
});
