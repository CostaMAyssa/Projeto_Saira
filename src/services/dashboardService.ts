import { supabase } from '@/lib/supabase';

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
  fields: any;
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
  answers: any;
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
        throw error; // Re-throw or handle as per project's error strategy
      }

      return data?.map(item => ({
        name: item.day_name,
        value: item.conversation_count
      })) || [];
    } catch (error) {
      // Catch re-thrown error or error from map
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
        throw error; // Re-throw or handle
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
}

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
      const { data, error } = await supabase
        .from('messages')
        .select('type, count:type') // Supabase doesn't directly support COUNT(*) GROUP BY in this JS syntax easily
                                   // A workaround is to use an RPC or a view, or process raw data.
                                   // Let's try a simpler query and process, or assume an RPC/view if this fails.
                                   // A more direct SQL query would be: SELECT type, COUNT(id) as value FROM messages GROUP BY type
                                   // For now, let's fetch 'type' and count manually or use a view if this was a real project.
                                   // Given the constraints, I'll fetch all types and count them in JS. This is not efficient for large datasets.
                                   // A better approach is an RPC call like: supabase.rpc('get_message_counts_by_type')

      // Workaround: Fetch all message types and aggregate in JS (inefficient for large data)
      // This is a simplified approach. A database function (RPC) or view would be better.
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
      // Get the date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // This query aims to replicate: SELECT TO_CHAR(started_at, 'Dy') as name, COUNT(DISTINCT client_id) as value 
      // FROM conversations WHERE started_at >= seven_days_ago GROUP BY TO_CHAR(started_at, 'Dy'), DATE_TRUNC('day', started_at) 
      // ORDER BY DATE_TRUNC('day', started_at);
      // Direct execution of complex SQL like this is better via rpc.
      // For now, fetching raw data and processing (less efficient).
      const { data, error } = await supabase
        .from('conversations')
        .select('client_id, started_at')
        .gte('started_at', sevenDaysAgo.toISOString());

      if (error) throw error;
      if (!data) return [];

      // Process data to group by day and count unique clients
      const dailyCounts: { [key: string]: Set<string> } = {}; // Store unique client_ids per day
      const dayOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; // JS getDay() Sunday=0
      
      data.forEach(convo => {
        const date = new Date(convo.started_at);
        const dayName = dayOrder[date.getDay()]; // 'Dom', 'Seg', etc.
        if (!dailyCounts[dayName]) {
          dailyCounts[dayName] = new Set();
        }
        dailyCounts[dayName].add(convo.client_id);
      });

      // Create ChartData, ensuring order (e.g., last 7 days ending today)
      // This part needs more robust date handling to ensure correct 7-day sequence
      const result: ChartData[] = [];
      for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i); // Iterate backwards for the last 7 days
          const dayName = dayOrder[date.getDay()];
          result.unshift({ name: dayName, value: dailyCounts[dayName]?.size || 0 });
      }
      // This simple unshift might not give a perfect Mon-Sun order, but daily counts for past 7 days.
      // For a strict Mon-Sun or Sun-Sat ordered week view, additional date logic is needed.
      // The prompt example is `[{name: 'Mon', value: 10}, ...]`
      // To achieve a fixed order of days of the week for the *current* week,
      // we'd need to align these counts to the correct day name slots.
      // Given the complexity and potential for off-by-one day issues with timezones,
      // a simplified "last 7 days" approach is taken here.
      // For a production app, a DB function or more robust date library (like date-fns) would be used.
      // Returning the days in chronological order for the last 7 days:
      const sortedResult: ChartData[] = [];
      const tempCounts: { [dateStr: string]: { name: string, count: number } } = {};

      data.forEach(convo => {
        const date = new Date(convo.started_at);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayName = dayOrder[date.getDay()];

        if (!tempCounts[dateKey]) {
          tempCounts[dateKey] = { name: dayName, count: 0 }; // Store dayName for reference
        }
        // This logic is still flawed for unique clients *per day*
      });
      
      // Corrected logic for unique clients per day for the last 7 distinct days present in data
      const uniqueClientsPerDay: { [dayKey: string]: { name: string, clients: Set<string> } } = {};
      const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayKey = d.toISOString().split('T')[0];
          const shortDayName = dayFormatter.format(d).replace('.', ''); // e.g. "seg"
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
      // Similar to messages, proper GROUP BY is better with RPC or view
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
      // This query should ideally sum messages_sent per campaign from campaign_executions
      // SELECT c.id, c.name, SUM(ce.messages_sent) as total_sent 
      // FROM campaigns c LEFT JOIN campaign_executions ce ON c.id = ce.campaign_id 
      // GROUP BY c.id, c.name;
      // This is complex for the basic JS client. Fetching campaigns and then their executions, or use RPC.

      // Simplified: Fetch all campaigns. For executions, this would be N+1 or another complex join.
      // For this task, let's assume campaign_executions has one relevant row or we take the first.
      // A more robust solution would use an RPC or a view.
      
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name');
      
      if (campaignsError) throw campaignsError;
      if (!campaigns) return [];

      const reportData: CampaignReportRow[] = [];
      for (const campaign of campaigns) {
        // For each campaign, try to get its execution data.
        // This is N+1, not ideal. A proper join in SQL (RPC/view) is better.
        const { data: executions, error: execError } = await supabase
          .from('campaign_executions')
          .select('messages_sent')
          .eq('campaign_id', campaign.id);

        if (execError) {
          console.warn(`Error fetching executions for campaign ${campaign.name}:`, execError);
          // Continue to next campaign or add with 0 sent
        }
        
        const totalSent = executions?.reduce((sum, exec) => sum + (exec.messages_sent || 0), 0) || 0;
        
        reportData.push({
          name: campaign.name,
          sent: totalSent,
          responses: "N/A", // Placeholder
          rate: "N/A",      // Placeholder
        });
      }
      return reportData;

    } catch (error) {
      console.error('Error fetching campaign report data:', error);
      return [];
    }
  }
// --- End of Report Specific Functions ---

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
        return trigger || 'Outro'; // Return original trigger or 'Outro' if null/empty
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
        // Attempt to find time in name for recurring, e.g. "Diário, 09:00"
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
        .select('*'); // Fetch all columns

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        throw campaignsError;
      }
      if (!campaigns) return [];

      const campaignDetails: CampaignUIData[] = [];

      for (const campaign of campaigns) {
        let lastRunString = "Nunca executado";
        // Fetch last execution for this campaign (N+1 query, consider optimizing with a view or join if perf is an issue)
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
        
        // Audience processing
        let audienceString = "Não definido";
        if (campaign.target_audience) {
            if (typeof campaign.target_audience === 'string') {
                audienceString = campaign.target_audience; // if it's a simple string
            } else if (typeof campaign.target_audience === 'object') {
                // Example: if target_audience is { "tag": "VIP" } -> "Tag: VIP"
                // This is a simple example, real parsing might be more complex
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
// --- End of Campaign Module Specific Functions ---


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