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

class DashboardService {
  // Buscar estatísticas principais do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Buscar conversas iniciadas nas últimas 24 horas
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: totalConversations, error: convError } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true }) // Count rows
        .gte('started_at', twentyFourHoursAgo);

      if (convError) {
        console.error('Error fetching conversation count:', convError);
        throw convError;
      }

      // Buscar clientes com status 'ativo'
      const { count: totalActiveClients, error: clientError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true }) // Count rows
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

  // Buscar dados para gráfico de conversas diárias
  async getDailyConversations(): Promise<ChartData[]> {
    try {
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
      const { data, error } = await supabase
        .from('campaigns') // Query 'campaigns' table
        .select('id, name, scheduled_for, trigger, target_audience')
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
      // Workaround: Fetch all message types and aggregate in JS (inefficient for large data)
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('type');

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
      
      const { data, error } = await supabase
        .from('conversations')
        .select('client_id, started_at')
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
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('category');

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
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name');
      
      if (campaignsError) throw campaignsError;
      if (!campaigns) return [];

      const reportData: CampaignReportRow[] = [];
      for (const campaign of campaigns) {
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
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*'); 

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        throw campaignsError;
      }
      if (!campaigns) return [];

      const campaignDetails: CampaignUIData[] = [];

      for (const campaign of campaigns) {
        let lastRunString = "Nunca executado";
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
    // Obter a sessão atual para pegar o ID do usuário logado
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error('Não foi possível obter a sessão do usuário.');
    }

    if (!sessionData.session) {
      throw new Error('Usuário não autenticado.');
    }

    // Adiciona o ID do usuário que está criando o cliente
    const clientToInsert = {
      ...clientData,
      created_by: sessionData.session.user.id, 
    };

    const { data, error } = await supabase
      .from('clients')
      .insert(clientToInsert)
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating client:", error);
      // Lançar o erro para ser pego pelo bloco catch no componente
      throw error; 
    }
    return data;
  }

  async updateClient(clientId: string, clientData: Partial<ClientData>): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId)
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
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting client ${clientId}:`, err);
      throw err;
    }
  }

  // --- Product CRUD Methods ---
  async createProduct(productData: ProductData): Promise<any> { // productData now adheres to stricter interface
    try {
      const productDataForSupabase = {
        ...productData, // Spread all fields from the stricter ProductData
        created_at: new Date().toISOString(), // Add created_at
      };

      console.log("📦 Dados enviados para o Supabase (insert):", productDataForSupabase); // Updated log message
      
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
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting product ${productId}:`, err);
      throw err;
    }
  }

  // --- Campaign CRUD Methods ---
  async createCampaign(campaignData: NewCampaignData): Promise<any> {
    try {
      console.log('DashboardService.createCampaign: Starting campaign creation with data:', campaignData);
      
      // Usar EXATAMENTE o mesmo padrão do createClient que está funcionando
      const campaignDataForSupabase = {
        name: campaignData.name,
        trigger: campaignData.trigger,
        status: campaignData.status,
        template: campaignData.template || 'Template padrão',
        target_audience: campaignData.target_audience || {}, // Manter como objeto JSON
        scheduled_for: campaignData.scheduled_for,
        created_by: '58ce41aa-d63d-4655-b1a1-9ee705e05c3a' // João da Silva (usuário existente)
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
      const { data, error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId)
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
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting campaign ${campaignId}:`, err);
      throw err;
    }
  }
} // End of DashboardService class

export const dashboardService = new DashboardService();

export const getForms = async () => {
  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_responses (
        count
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getFormById = async (id: string) => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createForm = async (form: Omit<Form, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('forms')
    .insert([form])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateForm = async (id: string, updates: Partial<Form>) => {
  const { data, error } = await supabase
    .from('forms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteForm = async (id: string) => {
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getFormResponses = async (formId: string) => {
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data;
}; 