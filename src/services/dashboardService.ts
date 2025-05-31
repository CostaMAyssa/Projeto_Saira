import { supabase, supabaseAdmin } from '@/lib/supabase';

export interface DashboardStats {
  conversations: {
    total: number;
    change: string;
    period: string;
  };
  activeClients: {
    total: number;
    change: string;
    period: string;
  };
  productsSold: {
    total: number;
    change: string;
    period: string;
  };
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Reminder {
  id: string;
  title: string;
  clientCount: number;
  scheduledDate: string;
  type: 'recompra' | 'aniversario' | 'posvenda';
}

export interface Form {
  id: string;
  title: string;
  fields: Record<string, unknown>;
  redirect_url: string;
  status: 'ativo' | 'inativo';
  question_count: number;
  created_by: string;
  created_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  client_id: string;
  answers: Record<string, unknown>;
  submitted_at: string;
  is_valid: boolean;
}

// Interface for Report Statistics
export interface ReportStats {
  responseRate: string;
  avgResponseTime: string;
  conversionRate: string;
}

// Interface for Campaign Report Data (can be more specific if needed)
export interface CampaignReportRow {
  name: string;
  sent: number;
  responses: string; // Placeholder
  rate: string;    // Placeholder
}

// Interface for Campaign UI Data
export interface CampaignUIData {
  id: string;
  name: string;
  type: string; // Mapped from trigger: 'Aniversário', 'Lembrete de Recompra', 'Manual', 'Pós-venda', 'Outro'
  audience: string; // Placeholder or simple description from target_audience
  status: 'active' | 'paused' | 'scheduled' | 'unknown'; // Mapped from campaigns.status
  schedule: string; // Formatted schedule string
  lastRun: string; // Formatted date or "Nunca executado"
}

// Interface for creating a new campaign
export interface NewCampaignData {
  name: string;
  trigger: string; // Should match DB enum/values for trigger
  status: 'ativa' | 'pausada' | 'agendada'; // DB status values
  template?: string;
  target_audience?: object; // JSON in DB
  scheduled_for?: string | null; // ISO string for timestamp
  // created_by is usually set by the backend/DB based on logged-in user
}

// --- Client CRUD Interfaces ---
export interface ClientData { // For creating/updating clients
  name: string;
  phone: string;
  email?: string | null;
  status: 'ativo' | 'inativo'; // DB status
  tags?: string[] | null;
  is_vip?: boolean | null;
  profile_type?: 'regular' | 'occasional' | 'vip' | null; // More specific types
  birth_date?: string | null; // ISO string for date
  created_by?: string; // User ID who created the client - required for creation
}

// --- Product CRUD Interfaces ---
// Updated ProductData to be stricter based on instruction for create operation
export interface ProductData { 
  name: string;
  category: string; 
  stock: number;    
  tags: string[];   
  needs_prescription: boolean; 
  controlled: boolean;         
  interval: number;            
}

// Interface for Campaign data from database
interface CampaignDBData {
  id: string;
  name: string;
  trigger: string;
  status: string;
  template?: string;
  target_audience?: Record<string, unknown>;
  scheduled_for?: string;
  created_by: string;
}

// Interface for database responses
interface SupabaseResponse<T> {
  data: T | null;
  error: any | null;
}

// Client response interface
interface ClientDBResponse {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: string;
  tags?: string[] | null;
  is_vip?: boolean | null;
  profile_type?: string | null;
  birth_date?: string | null;
  created_by: string;
  created_at: string;
}

// Placeholder for Product type, ensure it aligns with frontend needs
// Ideally, this would be imported from a shared types definition
export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  tags: string[];
  needs_prescription: boolean;
  controlled: boolean;
  interval: number;
  // Add other fields if necessary, like created_at, user_id etc.
  // For now, mirroring ProductData and common DB fields
  user_id?: string;
  created_by?: string;
  created_at?: string;
}


class DashboardService {
  // Buscar estatísticas principais do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const userId = user.id;

      // Buscar conversas iniciadas nas últimas 24 horas
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: totalConversations, error: convError } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true }) // Count rows
        .eq('user_id', userId)
        .gte('started_at', twentyFourHoursAgo);

      if (convError) {
        console.error('Error fetching conversation count:', convError);
        throw convError;
      }

      // Buscar clientes com status 'ativo'
      const { count: totalActiveClients, error: clientError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true }) // Count rows
        .eq('user_id', userId)
        .eq('status', 'ativo'); // Use 'ativo' as per schema

      if (clientError) {
        console.error('Error fetching active client count:', clientError);
        throw clientError;
      }

      // ProductsSold: No 'sales' table in schema. Returning 0 for now.
      const totalProductsSold = 0;

      return {
        conversations: {
          total: totalConversations || 0,
          change: "N/A", // Updated as per task
          period: 'Últimas 24 horas'
        },
        activeClients: {
          total: totalActiveClients || 0, // Corrected from activeClients?.length
          change: "N/A", // Updated as per task
          period: 'Este mês'
        },
        productsSold: {
          total: totalProductsSold,
          change: "N/A", // Updated as per task
          period: 'Este mês'
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      // Retornar dados padrão em caso de erro, with "N/A" for change
      return {
        conversations: { total: 0, change: "N/A", period: 'Últimas 24 horas' },
        activeClients: { total: 0, change: "N/A", period: 'Este mês' },
        productsSold: { total: 0, change: "N/A", period: 'Este mês' }
      };
    }
  }

  async getClients(): Promise<ClientDBResponse[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for getClients');
        return []; // Or throw error
      }
      const userId = user.id;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error('DashboardService.getClients: Error fetching clients:', err);
      throw err;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for getProducts');
        return []; // Or throw error
      }
      const userId = user.id;

      const { data, error } = await supabase
        .from('products')
        .select('*') // Adjust selection if needed for the Product type
        .eq('created_by', userId) // Filter by created_by
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      // Assuming the data from DB largely matches the Product interface structure
      // Transformation might be needed here if DB schema differs significantly from Product type
      return (data as Product[]) || [];
    } catch (err) {
      console.error('DashboardService.getProducts: Error fetching products:', err);
      throw err;
    }
  }

  // Buscar dados para gráfico de conversas diárias
  async getDailyConversations(): Promise<ChartData[]> {
    try {
      // TODO: Apply RLS or create a user-specific view for daily_conversations_view
      const { data, error } = await supabase
        .from('daily_conversations_view')
        .select('day_name, conversation_count')
        .order('day_order');

      if (error) {
        console.error('Erro ao buscar conversas diárias:', error);
        throw error;
      }

      return data?.map(item => ({
        name: item.day_name,
        value: item.conversation_count
      })) || [];
    } catch (error) {
      console.error('Erro final ao processar conversas diárias:', error);
      return []; // Return empty array on error
    }
  }

  // Buscar dados para gráfico de conversas mensais
  async getMonthlyConversations(): Promise<ChartData[]> {
    try {
      // TODO: Apply RLS or create a user-specific view for monthly_conversations_view
      const { data, error } = await supabase
        .from('monthly_conversations_view')
        .select('month_name, conversation_count')
        .order('month_order')
        .limit(6);

      if (error) {
        console.error('Erro ao buscar conversas mensais:', error);
        throw error;
      }

      return data?.map(item => ({
        name: item.month_name,
        value: item.conversation_count
      })) || [];
    } catch (error) {
      console.error('Erro final ao processar conversas mensais:', error);
      return []; // Return empty array on error
    }
  }

  // Buscar próximos lembretes/automações
  async getUpcomingReminders(): Promise<Reminder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const userId = user.id;

      const { data, error } = await supabase
        .from('campaigns') // Query 'campaigns' table
        .select('id, name, scheduled_for, trigger, target_audience')
        .eq('user_id', userId)
        .gte('scheduled_for', new Date().toISOString()) // Campaigns scheduled for future
        .order('scheduled_for', { ascending: true })
        .limit(6);

      if (error) {
        console.error('Error fetching upcoming campaigns:', error);
        throw error;
      }

      return data?.map((campaign: any) => {
        let type: Reminder['type'] = 'recompra'; // Default type
        if (campaign.trigger === 'aniversario') {
          type = 'aniversario';
        } else if (campaign.trigger === 'posvenda' || campaign.name.toLowerCase().includes('pós-venda') || campaign.name.toLowerCase().includes('pos venda')) {
          // Basic logic to map trigger/name to type, can be more sophisticated
          type = 'posvenda';
        }
        // clientCount is complex to calculate from target_audience here. Using 0 as placeholder.
        // In a real scenario, this might involve parsing JSON in target_audience or a separate query if possible.
        // Or, if campaign_executions table stores sent counts for scheduled campaigns, that could be used.
        // For now, we'll use a placeholder.
        const clientCount = 0; // Placeholder for client count

        return {
          id: campaign.id,
          title: campaign.name,
          clientCount: clientCount, 
          scheduledDate: campaign.scheduled_for,
          type: type,
        };
      }) || [];
    } catch (error) {
      console.error('Erro ao buscar lembretes de campanhas:', error);
      return [];
    }
  }

  // Função para formatar data relativa
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays > 1) return `Em ${diffDays} dias`;
    return 'Vencido';
  }

  // --- Report Specific Functions ---
  async getReportStats(): Promise<ReportStats> {
    // Returning placeholder values as specified
    return {
      responseRate: "N/A (placeholder)",
      avgResponseTime: "N/A (placeholder)",
      conversionRate: "N/A (placeholder)",
    };
  }

  async getMessagesByType(): Promise<ChartData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const userId = user.id;

      // Workaround: Fetch all message types and aggregate in JS (inefficient for large data)
      // TODO: This still fetches all messages then filters in JS if user_id is not on messages directly.
      // If messages table has user_id, this can be .eq('user_id', userId)
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('type, user_id') // Assuming user_id exists or will be added
        .eq('user_id', userId);


      if (messagesError) throw messagesError;
      if (!allMessages) return [];

      const counts: { [key: string]: number } = {};
      for (const message of allMessages) {
        if (message.type) {
          counts[message.type] = (counts[message.type] || 0) + 1;
        }
      }
      return Object.entries(counts).map(([name, value]) => ({ name, value }));

    } catch (error) {
      console.error('Error fetching messages by type:', error);
      return [];
    }
  }

  async getClientsServedLastWeek(): Promise<ChartData[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const userId = user.id;
      
      const { data, error } = await supabase
        .from('conversations')
        .select('client_id, started_at')
        .eq('user_id', userId)
        .gte('started_at', sevenDaysAgo.toISOString());

      if (error) throw error;
      if (!data) return [];
      
      const uniqueClientsPerDay: { [dayKey: string]: { name: string, clients: Set<string> } } = {};
      const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
      const dayOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];


      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayKey = d.toISOString().split('T')[0];
          // Ensure consistent day name formatting (e.g., "Seg" not "seg.")
          let shortDayName = dayFormatter.format(d);
          if (shortDayName.endsWith('.')) shortDayName = shortDayName.slice(0, -1); // Remove trailing dot
          uniqueClientsPerDay[dayKey] = { name: shortDayName.charAt(0).toUpperCase() + shortDayName.slice(1), clients: new Set() };
      }
      
      data.forEach(convo => {
          const date = new Date(convo.started_at);
          const dayKey = date.toISOString().split('T')[0];
          if (uniqueClientsPerDay[dayKey]) {
            uniqueClientsPerDay[dayKey].clients.add(convo.client_id);
          }
      });

      return Object.values(uniqueClientsPerDay).map(dayData => ({
          name: dayData.name,
          value: dayData.clients.size,
      }));

    } catch (error) {
      console.error('Error fetching clients served last week:', error);
      return [];
    }
  }

  async getProductCategoryDistribution(): Promise<ChartData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const userId = user.id;

      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('category')
        .eq('created_by', userId); // Filter by created_by

      if (productsError) throw productsError;
      if (!allProducts) return [];

      const counts: { [key: string]: number } = {};
      for (const product of allProducts) {
        if (product.category) {
          counts[product.category] = (counts[product.category] || 0) + 1;
        }
      }
      return Object.entries(counts).map(([name, value]) => ({ name, value }));

    } catch (error) {
      console.error('Error fetching product category distribution:', error);
      return [];
    }
  }

  async getCampaignReportData(): Promise<CampaignReportRow[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const userId = user.id;

      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('user_id', userId);
      
      if (campaignsError) throw campaignsError;
      if (!campaigns) return [];

      const reportData: CampaignReportRow[] = [];
      for (const campaign of campaigns) {
        // TODO: campaign_executions might need user_id or join for RLS
        const { data: executions, error: execError } = await supabase
          .from('campaign_executions')
          .select('messages_sent')
          .eq('campaign_id', campaign.id);

        if (execError) {
          console.warn(`Error fetching executions for campaign ${campaign.name}:`, execError);
        }
        
        const totalSent = executions?.reduce((sum, exec) => sum + (exec.messages_sent || 0), 0) || 0;
        
        reportData.push({
          name: campaign.name,
          sent: totalSent,
          responses: "N/A", 
          rate: "N/A",      
        });
      }
      return reportData;

    } catch (error) {
      console.error('Error fetching campaign report data:', error);
      return [];
    }
  }

  // --- Campaign Module Specific Functions ---
  private mapCampaignTriggerToType(trigger: string): string {
    switch (trigger?.toLowerCase()) {
      case 'aniversario':
        return 'Aniversário';
      case 'recorrente':
        return 'Lembrete de Recompra';
      case 'manual':
        return 'Manual';
      case 'posvenda':
      case 'pós-venda':
        return 'Pós-venda';
      default:
        return trigger || 'Outro';
    }
  }

  private mapCampaignStatus(status: string): CampaignUIData['status'] {
    switch (status?.toLowerCase()) {
      case 'ativa':
        return 'active';
      case 'pausada':
        return 'paused';
      case 'agendada':
        return 'scheduled';
      default:
        return 'unknown';
    }
  }

  private formatCampaignSchedule(campaign: any): string {
    if (campaign.scheduled_for) {
      try {
        const date = new Date(campaign.scheduled_for);
        return `Agendado para ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      } catch (e) {
        return "Data de agendamento inválida";
      }
    }
    if (campaign.trigger?.toLowerCase() === 'recorrente') {
        const timeMatch = campaign.name.match(/(\d{2}:\d{2})/);
        if (timeMatch) return `Recorrente (${timeMatch[0]})`;
        return "Recorrente";
    }
    if (campaign.trigger?.toLowerCase() === 'aniversario') {
        return "Aniversário (automático)";
    }
    return "Não agendado ou Manual";
  }
  
  async getAllCampaignsDetails(): Promise<CampaignUIData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const userId = user.id;

      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', userId);

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        throw campaignsError;
      }
      if (!campaigns) return [];

      const campaignDetails: CampaignUIData[] = [];

      for (const campaign of campaigns) {
        let lastRunString = "Nunca executado";
        // TODO: campaign_executions might need user_id or join for RLS
        const { data: executions, error: execError } = await supabase
          .from('campaign_executions')
          .select('executed_at')
          .eq('campaign_id', campaign.id)
          .order('executed_at', { ascending: false })
          .limit(1);

        if (execError) {
          console.warn(`Error fetching executions for campaign ${campaign.id}:`, execError);
        }

        if (executions && executions.length > 0 && executions[0].executed_at) {
          try {
            const date = new Date(executions[0].executed_at);
            lastRunString = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          } catch (e) {
            lastRunString = "Data da última execução inválida";
          }
        }
        
        let audienceString = "Não definido";
        if (campaign.target_audience) {
            if (typeof campaign.target_audience === 'string') {
                audienceString = campaign.target_audience; 
            } else if (typeof campaign.target_audience === 'object') {
                const keys = Object.keys(campaign.target_audience);
                if (keys.length > 0) {
                    audienceString = keys.map(key => `${key}: ${JSON.stringify(campaign.target_audience[key])}`).join(', ');
                } else {
                    audienceString = "Critérios específicos";
                }
            }
        }

        campaignDetails.push({
          id: campaign.id,
          name: campaign.name,
          type: this.mapCampaignTriggerToType(campaign.trigger),
          audience: audienceString,
          status: this.mapCampaignStatus(campaign.status),
          schedule: this.formatCampaignSchedule(campaign),
          lastRun: lastRunString,
        });
      }
      return campaignDetails;
    } catch (error) {
      console.error('Error in getAllCampaignsDetails:', error);
      return [];
    }
  }

  // --- Client CRUD Methods ---
  async createClient(clientData: ClientData): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for creating client');
      const userId = user.id;

      console.log('DashboardService.createClient: Starting client creation with data:', clientData);
      
      const clientDataForSupabase = {
        ...clientData,
        created_by: userId,
        user_id: userId, // Assuming 'user_id' is the column for ownership
        created_at: new Date().toISOString(),
      };

      console.log("👤 Dados enviados para o Supabase (insert):", clientDataForSupabase);
      
      const { data, error } = await supabase
        .from('clients')
        .insert([clientDataForSupabase])
        .select()
        .single();

      if (error) {
        console.error('Error creating client in Supabase:', error);
        throw error;
      }
      
      console.log('DashboardService.createClient: Successfully created client:', data);
      return data;
    } catch (err) {
      console.error('DashboardService.createClient: Error creating client:', err);
      throw err;
    }
  }

  async updateClient(clientId: string, clientData: Partial<ClientData>): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for updating client');
      const userId = user.id;

      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId)
        .eq('user_id', userId) // Ensure user owns the client
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error updating client ${clientId}:`, err);
      throw err;
    }
  }

  async deleteClient(clientId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for deleting client');
      const userId = user.id;

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', userId); // Ensure user owns the client
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting client ${clientId}:`, err);
      throw err;
    }
  }

  // --- Product CRUD Methods ---
  async createProduct(productData: ProductData): Promise<any> { // productData now adheres to stricter interface
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for creating product');
      const userId = user.id;

      const productDataForSupabase = {
        ...productData,
        // user_id: userId, // Remove if created_by is the sole field for user association
        created_by: userId, // Ensure created_by is set to the user's ID
        created_at: new Date().toISOString(),
      };

      console.log("📦 Dados enviados para o Supabase (insert):", productDataForSupabase);
      
      const { data, error } = await supabase
        .from('products')
        .insert([productDataForSupabase])
        .select()
        .single();

      if (error) {
        console.error('Error creating product in Supabase:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('Exception in createProduct service method:', err);
      throw err;
    }
  }

  // For update, Partial<ProductData> is still good, but ProductData itself is now stricter
  async updateProduct(productId: string, productData: Partial<ProductData>): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for updating product');
      const userId = user.id;

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .eq('created_by', userId) // Ensure user owns the product by checking created_by
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error updating product ${productId}:`, err);
      throw err;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for deleting product');
      const userId = user.id;

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('created_by', userId); // Ensure user owns the product by checking created_by
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting product ${productId}:`, err);
      throw err;
    }
  }

  // --- Campaign CRUD Methods ---
  async createCampaign(campaignData: NewCampaignData): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for creating campaign');
      const userId = user.id;

      console.log('DashboardService.createCampaign: Starting campaign creation with data:', campaignData);
      
      const campaignDataForSupabase = {
        name: campaignData.name,
        trigger: campaignData.trigger,
        status: campaignData.status,
        template: campaignData.template || 'Template padrão',
        target_audience: campaignData.target_audience || {},
        scheduled_for: campaignData.scheduled_for,
        created_by: userId, // Set actual user ID
        user_id: userId, // Assuming 'user_id' is the column for ownership
      };

      console.log("📢 Dados enviados para o Supabase (insert):", campaignDataForSupabase);
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignDataForSupabase])
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign in Supabase:', error);
        throw error;
      }
      
      console.log('DashboardService.createCampaign: Successfully created campaign:', data);
      return data;
    } catch (err) {
      console.error('DashboardService.createCampaign: Error creating campaign:', err);
      throw err;
    }
  }

  async updateCampaignStatus(campaignId: string, status: string): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for updating campaign status');
      const userId = user.id;

      const { data, error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId)
        .eq('user_id', userId) // Ensure user owns the campaign
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error updating campaign status ${campaignId}:`, err);
      throw err;
    }
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for deleting campaign');
      const userId = user.id;

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', userId); // Ensure user owns the campaign
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting campaign ${campaignId}:`, err);
      throw err;
    }
  }
} // End of DashboardService class

export const dashboardService = new DashboardService();

export const getForms = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const userId = user.id;

  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_responses (
        count
      )
    `)
    .eq('user_id', userId) // Filter by user_id
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getFormById = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const userId = user.id;

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId) // Filter by user_id
    .single();

  if (error) throw error;
  return data;
};

export const createForm = async (form: Omit<Form, 'id' | 'created_at' | 'created_by'> & { user_id?: string }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const userId = user.id;

  const formData = {
    ...form,
    user_id: userId, // Ensure user_id is set
    created_by: userId, // Also set created_by if it's a separate field
  };

  const { data, error } = await supabase
    .from('forms')
    .insert([formData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateForm = async (id: string, updates: Partial<Form>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const userId = user.id;

  const { data, error } = await supabase
    .from('forms')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId) // Filter by user_id
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteForm = async (id: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  const userId = user.id;

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Filter by user_id

  if (error) throw error;
};

export const getFormResponses = async (formId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  // const userId = user.id; // userId might not be directly on form_responses

  // TODO: Filter form_responses based on user ownership.
  // This might require joining with 'forms' table and filtering by forms.user_id
  // or ensuring form_responses has a user_id if responses are user-specific beyond form ownership.
  // For now, assuming direct query if form_id implies user access (e.g. user can only request their forms' responses).
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data;
}; 