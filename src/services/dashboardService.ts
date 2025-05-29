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
          change: '+12%',
          period: 'Últimas 24 horas'
        },
        activeClients: {
          total: activeClients?.length || 0,
          change: '+5%',
          period: 'Este mês'
        },
        productsSold: {
          total: totalProductsSold,
          change: '+8%',
          period: 'Este mês'
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      // Retornar dados padrão em caso de erro
      return {
        conversations: { total: 0, change: '0%', period: 'Últimas 24 horas' },
        activeClients: { total: 0, change: '0%', period: 'Este mês' },
        productsSold: { total: 0, change: '0%', period: 'Este mês' }
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

      if (error) throw error;

      return data?.map(item => ({
        name: item.day_name,
        value: item.conversation_count
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar conversas diárias:', error);
      // Retornar dados padrão
      return [
        { name: 'Seg', value: 0 },
        { name: 'Ter', value: 0 },
        { name: 'Qua', value: 0 },
        { name: 'Qui', value: 0 },
        { name: 'Sex', value: 0 },
        { name: 'Sáb', value: 0 },
        { name: 'Dom', value: 0 },
      ];
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

      if (error) throw error;

      return data?.map(item => ({
        name: item.month_name,
        value: item.conversation_count
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar conversas mensais:', error);
      // Retornar dados padrão
      return [
        { name: 'Jan', value: 0 },
        { name: 'Fev', value: 0 },
        { name: 'Mar', value: 0 },
        { name: 'Abr', value: 0 },
        { name: 'Mai', value: 0 },
        { name: 'Jun', value: 0 },
      ];
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