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
      // Buscar conversas das últimas 24 horas
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (convError) throw convError;

      // Buscar clientes ativos deste mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: activeClients, error: clientError } = await supabase
        .from('clients')
        .select('id, last_interaction')
        .gte('last_interaction', startOfMonth.toISOString())
        .eq('status', 'active');

      if (clientError) throw clientError;

      // Buscar produtos vendidos deste mês
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('quantity')
        .gte('created_at', startOfMonth.toISOString());

      if (salesError) throw salesError;

      const totalProductsSold = sales?.reduce((sum, sale) => sum + (sale.quantity || 0), 0) || 0;

      return {
        conversations: {
          total: conversations?.length || 0,
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
        .from('reminders')
        .select(`
          id,
          title,
          client_count,
          scheduled_date,
          type
        `)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date')
        .limit(6);

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        title: item.title,
        clientCount: item.client_count,
        scheduledDate: item.scheduled_date,
        type: item.type
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar lembretes:', error);
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