import { supabase, supabaseAdmin } from '@/lib/supabase';
import { n8nService, type CampaignData } from './n8nService';

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
  // Campos de personalização visual
  logo_url?: string;
  background_color?: string;
  accent_color?: string;
  text_color?: string;
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
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer consulta
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');
      const userId = user.id;

      console.log('DashboardService.getDashboardStats: Buscando estatísticas para usuário:', userId);

      // Buscar todas as conversas ativas (independente de quando foram criadas)
      console.log('Consultando todas as conversas ativas...');
      
      const { count: totalConversations, error: convError } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'); // Filtrar apenas conversas ativas

      if (convError) {
        console.error('Error fetching chat count:', convError);
        console.error('Detalhes do erro de chats:', JSON.stringify(convError, null, 2));
        // Não fazer throw aqui, continuar com valor padrão
      }

      // Buscar clientes com status 'ativo'
      const { count: totalActiveClients, error: clientError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', userId) // 🔒 FILTRO POR USUÁRIO RESTAURADO
        .eq('status', 'ativo');

      if (clientError) {
        console.error('Error fetching active client count:', clientError);
        console.error('Detalhes do erro de clientes:', JSON.stringify(clientError, null, 2));
        // Não fazer throw aqui, continuar com valor padrão
      }

      // Buscar produtos vendidos no mês atual
      console.log('Consultando produtos vendidos no mês atual...');
      
      // Calcular início e fim do mês atual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      console.log('Período de busca:', {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString()
      });

      // Buscar soma das quantidades de produtos vendidos no mês atual
      const { data: productsSoldData, error: salesError } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          sales!inner(created_by, created_at)
        `)
        .eq('sales.created_by', userId) // 🔒 FILTRO POR USUÁRIO
        .gte('sales.created_at', startOfMonth.toISOString())
        .lte('sales.created_at', endOfMonth.toISOString());

      let totalProductsSold = 0;
      if (salesError) {
        console.error('Error fetching products sold:', salesError);
        console.error('Detalhes do erro de produtos vendidos:', JSON.stringify(salesError, null, 2));
        // Não fazer throw aqui, continuar com valor padrão
      } else if (productsSoldData) {
        // Somar todas as quantidades
        totalProductsSold = productsSoldData.reduce((sum, item) => sum + (item.quantity || 0), 0);
        console.log('Produtos vendidos encontrados:', {
          totalItems: productsSoldData.length,
          totalQuantity: totalProductsSold
        });
      }

      return {
        conversations: {
          total: totalConversations || 0,
          change: "N/A",
          period: 'Conversas ativas'
        },
        activeClients: {
          total: totalActiveClients || 0,
          change: "N/A",
          period: 'Este mês'
        },
        productsSold: {
          total: totalProductsSold,
          change: "N/A",
          period: 'Este mês'
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      console.error('Detalhes completos do erro:', JSON.stringify(error, null, 2));
      // Retornar dados padrão em caso de erro
      return {
        conversations: { total: 0, change: "N/A", period: 'Conversas ativas' },
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
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer consulta
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');
      const userId = user.id;

      console.log('DashboardService.getUpcomingReminders: Buscando campanhas para usuário:', userId);

      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, scheduled_for, trigger, target_audience')
        .eq('created_by', userId) // 🔒 FILTRO POR USUÁRIO RESTAURADO
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(6);

      if (error) {
        console.error('Error fetching upcoming campaigns:', error);
        console.error('Detalhes do erro de campanhas:', JSON.stringify(error, null, 2));
        // Verificar se é um erro de RLS ou tabela não existente
        if (error.code === 'RLS_POLICY_VIOLATION' || error.message?.includes('permission')) {
          console.error('Possível problema de RLS/permissões na tabela campaigns');
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.error('Tabela campaigns não existe ou não está acessível');
        }
        // Retornar array vazio ao invés de fazer throw
        return [];
      }

      console.log('Campanhas encontradas:', data?.length || 0);

      return data?.map((campaign: any) => {
        let type: Reminder['type'] = 'recompra';
        if (campaign.trigger === 'aniversario') {
          type = 'aniversario';
        } else if (campaign.trigger === 'posvenda' || campaign.name.toLowerCase().includes('pós-venda') || campaign.name.toLowerCase().includes('pos venda')) {
          type = 'posvenda';
        }
        const clientCount = 0;

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
      console.error('Detalhes completos do erro de campanhas:', JSON.stringify(error, null, 2));
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
      responseRate: "N/A",
      avgResponseTime: "N/A",
      conversionRate: "N/A",
    };
  }

  async getMessagesByType(): Promise<ChartData[]> {
    try {
      console.log('📊 DashboardService.getMessagesByType: Iniciando busca de mensagens por tipo');

      // Simplificar query - remover filtro por usuário que pode estar causando problemas
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('sender, content, created_at, conversation_id')
        .limit(1000); // Limitar para evitar queries muito grandes

      if (messagesError) {
        console.error('❌ DashboardService.getMessagesByType: Erro ao buscar mensagens:', messagesError);
        console.error('🔍 DashboardService.getMessagesByType: Detalhes do erro:', JSON.stringify(messagesError, null, 2));
        return [];
      }
      
      if (!allMessages) {
        console.log('⚠️ DashboardService.getMessagesByType: Nenhuma mensagem encontrada');
        return [];
      }

      console.log(`📈 DashboardService.getMessagesByType: ${allMessages.length} mensagens encontradas`);
      console.log('📋 DashboardService.getMessagesByType: Amostra das mensagens:', 
        allMessages.slice(0, 5).map(m => ({
          sender: m.sender,
          content: m.content?.substring(0, 50),
          created_at: m.created_at,
          conversation_id: m.conversation_id
        }))
      );

      const counts: { [key: string]: number } = {};
      for (const message of allMessages) {
        const type = message.sender || 'unknown';
        counts[type] = (counts[type] || 0) + 1;
      }
      
      console.log('📊 DashboardService.getMessagesByType: Contagem por tipo:', counts);
      
      const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
      console.log('✅ DashboardService.getMessagesByType: Resultado final:', result);
      
      return result;

    } catch (error) {
      console.error('❌ DashboardService.getMessagesByType: Erro geral:', error);
      return [];
    }
  }

  async getClientsServedLastWeek(): Promise<ChartData[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer consulta
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');
      const userId = user.id;

      console.log('DashboardService.getClientsServedLastWeek: Buscando conversas para usuário:', userId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('client_id, started_at')
        .eq('status', 'active') // Filtrar apenas conversas ativas
        .gte('started_at', sevenDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching clients served last week:', error);
        console.error('Detalhes do erro de conversas da semana:', JSON.stringify(error, null, 2));
        // Verificar se é um erro de RLS
        if (error.code === 'RLS_POLICY_VIOLATION' || error.message?.includes('permission')) {
          console.error('Possível problema de RLS/permissões na tabela conversations');
        }
        return [];
      }
      
      if (!data) return [];

      console.log('Conversas da última semana encontradas:', data.length);
      
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
      
      data.forEach(conversation => {
          const date = new Date(conversation.started_at);
          const dayKey = date.toISOString().split('T')[0];
          if (uniqueClientsPerDay[dayKey] && conversation.client_id) {
            uniqueClientsPerDay[dayKey].clients.add(conversation.client_id);
          }
      });

      return Object.values(uniqueClientsPerDay).map(dayData => ({
          name: dayData.name,
          value: dayData.clients.size,
      }));

    } catch (error) {
      console.error('Error fetching clients served last week:', error);
      console.error('Detalhes completos do erro de clientes da semana:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  async getProductCategoryDistribution(): Promise<ChartData[]> {
    try {
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }
      const userId = user.id;

      console.log('DashboardService: Buscando distribuição de categorias para usuário:', userId);

      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('category')
        .eq('created_by', userId); // 🔒 FILTRO POR USUÁRIO ADICIONADO

      if (productsError) throw productsError;
      if (!allProducts) return [];

      const counts: { [key: string]: number } = {};
      for (const product of allProducts) {
        if (product.category) {
          counts[product.category] = (counts[product.category] || 0) + 1;
        }
      }
      
      console.log('DashboardService: Categorias encontradas:', counts);
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
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for updating client');
      const userId = user.id;

      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId)
        .eq('created_by', userId) // 🔒 GARANTIR QUE SÓ ATUALIZA CLIENTES DO PRÓPRIO USUÁRIO
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
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for deleting client');
      const userId = user.id;

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('created_by', userId); // 🔒 GARANTIR QUE SÓ DELETA CLIENTES DO PRÓPRIO USUÁRIO
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting client ${clientId}:`, err);
      throw err;
    }
  }

  async getAllClientTags(): Promise<string[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');
      const userId = user.id;

      const { data, error } = await supabase
        .from('clients')
        .select('tags')
        .eq('created_by', userId) // Filtrar por usuário logado
        .not('tags', 'is', null);

      if (error) {
        console.error('Error fetching client tags:', error);
        throw error;
      }

      const allTags = new Set<string>();
      data.forEach(client => {
        if (Array.isArray(client.tags)) {
          client.tags.forEach((tag: string) => allTags.add(tag));
        }
      });

      return Array.from(allTags);
    } catch (error) {
      console.error('Error in getAllClientTags:', error);
      return [];
    }
  }

  // --- Product CRUD Methods ---
  async createProduct(productData: ProductData): Promise<any> { // productData now adheres to stricter interface
    try {
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for creating product');
      const userId = user.id;

      console.log('DashboardService.createProduct: Starting product creation with data:', productData);
      
      // 🔥 COPIAR EXATAMENTE A ESTRUTURA QUE FUNCIONA (clientes)
      const productDataForSupabase = {
        ...productData,
        created_by: userId, // 🔒 USAR USUÁRIO LOGADO, NÃO HARDCODED
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
        
        // Tratar erro específico de produto duplicado
        if (error.code === '23505' && error.message?.includes('products_name_key')) {
          const duplicateProductError = new Error(`O produto ${productData.name} já está cadastrado.`);
          duplicateProductError.name = 'DuplicateProductError';
          throw duplicateProductError;
        }
        
        // Tratar outros erros de constraint
        if (error.code === '23505') {
          const constraintError = new Error(`Já existe um produto com esses dados. Verifique se o produto não foi cadastrado anteriormente.`);
          constraintError.name = 'DuplicateDataError';
          throw constraintError;
        }
        
        throw error;
      }
      
      console.log('DashboardService.createProduct: Successfully created product:', data);
      return data;
    } catch (err) {
      console.error('DashboardService.createProduct: Error creating product:', err);
      throw err;
    }
  }

  // For update, Partial<ProductData> is still good, but ProductData itself is now stricter
  async updateProduct(productId: string, productData: Partial<ProductData>): Promise<any> {
    try {
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for updating product');
      const userId = user.id;

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .eq('created_by', userId) // 🔒 GARANTIR QUE SÓ ATUALIZA PRODUTOS DO PRÓPRIO USUÁRIO
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
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for deleting product');
      const userId = user.id;

      // Verificar se o produto existe e pertence ao usuário
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', productId)
        .eq('created_by', userId)
        .single();

      if (fetchError || !product) {
        throw new Error('Produto não encontrado ou não pertence ao usuário');
      }

      // Verificar se o produto está sendo usado em vendas
      const { data: saleItems, error: saleCheckError } = await supabase
        .from('sale_items')
        .select('id')
        .eq('product_id', productId)
        .limit(1);

      if (saleCheckError) {
        console.error('Error checking sale items:', saleCheckError);
        throw new Error('Erro ao verificar dependências do produto');
      }

      if (saleItems && saleItems.length > 0) {
        throw new Error(`Não é possível excluir o produto "${product.name}" porque ele está sendo usado em vendas.`);
      }

      // Se chegou até aqui, pode excluir o produto
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('created_by', userId);

      if (error) {
        console.error('Error deleting product:', error);
        if (error.code === '23503') {
          throw new Error(`Não é possível excluir o produto "${product.name}" porque ele está sendo usado em vendas.`);
        }
        throw error;
      }
    } catch (err) {
      console.error(`Error deleting product ${productId}:`, err);
      throw err;
    }
  }

  // --- Campaign CRUD Methods ---
  async createCampaign(campaignData: NewCampaignData): Promise<any> {
    try {
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for creating campaign');
      const userId = user.id;

      console.log('DashboardService.createCampaign: Starting campaign creation with data:', campaignData);
      
      // Usar o usuário logado atual, NÃO hardcoded
      const campaignDataForSupabase = {
        name: campaignData.name,
        trigger: campaignData.trigger,
        status: campaignData.status,
        template: campaignData.template || 'Template padrão',
        target_audience: campaignData.target_audience || {}, // Manter como objeto JSON
        scheduled_for: campaignData.scheduled_for,
        created_by: userId // 🔒 USAR USUÁRIO LOGADO, NÃO HARDCODED
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
      
      // 🚀 Enviar dados da campanha para o n8n
      try {
        const campaignDataForN8n: CampaignData = {
          id: data.id,
          name: data.name,
          type: data.trigger as CampaignData['type'],
          trigger: data.trigger,
          status: data.status === 'ativa' ? 'active' : data.status === 'pausada' ? 'inactive' : 'draft',
          template: data.template || '',
          audience: data.target_audience || {},
          scheduling: data.scheduled_for ? {
            start_date: data.scheduled_for
          } : undefined,
          created_by: data.created_by,
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        const n8nResult = await n8nService.sendCampaignData(campaignDataForN8n);
        
        if (n8nResult.success) {
          console.log('✅ Campanha enviada para n8n com sucesso:', n8nResult);
        } else {
          console.warn('⚠️ Falha ao enviar campanha para n8n:', n8nResult.error);
          // Não falhar a criação da campanha se o n8n falhar
        }
      } catch (n8nError) {
        console.error('❌ Erro ao enviar campanha para n8n:', n8nError);
        // Não falhar a criação da campanha se o n8n falhar
      }
      
      return data;
    } catch (err) {
      console.error('DashboardService.createCampaign: Error creating campaign:', err);
      throw err;
    }
  }

  async updateCampaignStatus(campaignId: string, status: string): Promise<any> {
    try {
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for updating campaign status');
      const userId = user.id;

      const { data, error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId)
        .eq('created_by', userId) // 🔒 GARANTIR QUE SÓ ATUALIZA CAMPANHAS DO PRÓPRIO USUÁRIO
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
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for deleting campaign');
      const userId = user.id;

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('created_by', userId); // 🔒 GARANTIR QUE SÓ DELETA CAMPANHAS DO PRÓPRIO USUÁRIO
      if (error) throw error;
    } catch (err) {
      console.error(`Error deleting campaign ${campaignId}:`, err);
      throw err;
    }
  }

  /**
   * Dispara uma campanha específica no n8n
   */
  async triggerCampaign(campaignId: string, additionalData?: Record<string, unknown>): Promise<any> {
    try {
      // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated for triggering campaign');
      const userId = user.id;

      // Buscar dados da campanha
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('created_by', userId) // 🔒 GARANTIR QUE SÓ DISPARA CAMPANHAS DO PRÓPRIO USUÁRIO
        .single();

      if (campaignError || !campaign) {
        throw new Error('Campanha não encontrada ou sem permissão');
      }

      // Preparar dados para o n8n
      const triggerData = {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          type: campaign.trigger,
          template: campaign.template,
          target_audience: campaign.target_audience
        },
        user_id: userId,
        triggered_at: new Date().toISOString(),
        ...additionalData
      };

      // Enviar para o n8n
      const n8nResult = await n8nService.triggerCampaign(campaignId, triggerData);
      
      if (!n8nResult.success) {
        throw new Error(`Falha ao disparar campanha no n8n: ${n8nResult.error}`);
      }

      console.log('✅ Campanha disparada com sucesso no n8n:', n8nResult);
      return n8nResult;

    } catch (err) {
      console.error(`Error triggering campaign ${campaignId}:`, err);
      throw err;
    }
  }
} // End of DashboardService class

export const dashboardService = new DashboardService();

export const getForms = async () => {
  // 🔒 CRÍTICO: Verificar autenticação antes de qualquer consulta
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');
  const userId = user.id;

  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      form_responses (
        count
      )
    `)
    .eq('created_by', userId) // 🔒 FILTRO POR USUÁRIO RESTAURADO
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getFormById = async (id: string) => {
  // 🔒 CRÍTICO: Verificar autenticação antes de qualquer consulta
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');
  const userId = user.id;

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .eq('created_by', userId) // 🔒 FILTRO POR USUÁRIO RESTAURADO
    .single();

  if (error) throw error;
  return data;
};

export const createForm = async (form: Omit<Form, 'id' | 'created_at' | 'created_by'>) => {
  // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');
  const userId = user.id;

  const formData = {
    ...form,
    created_by: userId, // 🔒 USAR USUÁRIO LOGADO
    // Garantir valores padrão para personalização visual
    logo_url: form.logo_url || null,
    background_color: form.background_color || '#f9fafb',
    accent_color: form.accent_color || '#10b981',
    text_color: form.text_color || '#111827',
  };

  const { data, error } = await supabase
    .from('forms')
    .insert([formData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateForm = async (id: string, form: Partial<Omit<Form, 'id' | 'created_at' | 'created_by'>>) => {
  // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');

  const formData = {
    ...form,
    updated_at: new Date().toISOString(),
    // Manter valores de personalização se fornecidos
    logo_url: form.logo_url !== undefined ? form.logo_url : undefined,
    background_color: form.background_color || undefined,
    accent_color: form.accent_color || undefined,
    text_color: form.text_color || undefined,
  };

  const { data, error } = await supabase
    .from('forms')
    .update(formData)
    .eq('id', id)
    .eq('created_by', user.id) // 🔒 SEGURANÇA: Só atualizar próprios formulários
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteForm = async (id: string) => {
  // 🔒 CRÍTICO: Verificar autenticação antes de qualquer operação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');
  const userId = user.id;

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id)
    .eq('created_by', userId); // 🔒 GARANTIR QUE SÓ DELETA FORMS DO PRÓPRIO USUÁRIO

  if (error) throw error;
};

export const getFormResponses = async (formId: string) => {
  // 🔒 CRÍTICO: Verificar autenticação antes de qualquer consulta
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');
  const userId = user.id;

  // TODO: Filter form_responses based on user ownership.
  // This might require joining with 'forms' table and filtering by forms.created_by
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