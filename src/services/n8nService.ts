/**
 * Serviço para integração com n8n
 * Responsável por enviar dados de campanhas para os workflows do n8n
 */

export interface CampaignData {
  id: string;
  name: string;
  type: 'recompra' | 'aniversario' | 'pos_venda' | 'reativacao' | 'promocao';
  trigger: string;
  status: 'active' | 'inactive' | 'draft';
  template: string;
  audience: Record<string, unknown>;
  scheduling?: {
    start_date?: string;
    end_date?: string;
    frequency?: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface N8nWebhookResponse {
  success: boolean;
  message?: string;
  executionId?: string;
  error?: string;
}

class N8nService {
  private webhookUrl: string;
  private apiUrl: string;

  constructor() {
    this.webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '';
    this.apiUrl = import.meta.env.VITE_N8N_API_URL || '';
    
    if (!this.webhookUrl) {
      console.warn('⚠️ N8N_WEBHOOK_URL não configurada');
    }
  }

  /**
   * Envia dados da campanha para o webhook do n8n
   */
  async sendCampaignData(campaignData: CampaignData): Promise<N8nWebhookResponse> {
    if (!this.webhookUrl) {
      throw new Error('URL do webhook n8n não configurada');
    }

    try {
      console.log('📤 Enviando dados da campanha para n8n:', {
        campaignId: campaignData.id,
        campaignName: campaignData.name,
        campaignType: campaignData.type,
        webhookUrl: this.webhookUrl
      });

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'campaign_created',
          data: campaignData,
          timestamp: new Date().toISOString(),
          source: 'saira_frontend'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      console.log('✅ Dados enviados com sucesso para n8n:', result);
      
      return {
        success: true,
        message: 'Campanha enviada para n8n com sucesso',
        executionId: result.executionId,
        ...result
      };

    } catch (error) {
      console.error('❌ Erro ao enviar dados para n8n:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Falha ao enviar campanha para n8n'
      };
    }
  }

  /**
   * Envia dados de trigger de campanha (quando uma campanha é ativada/executada)
   */
  async triggerCampaign(campaignId: string, triggerData: Record<string, unknown>): Promise<N8nWebhookResponse> {
    if (!this.webhookUrl) {
      throw new Error('URL do webhook n8n não configurada');
    }

    try {
      console.log('🚀 Disparando campanha no n8n:', {
        campaignId,
        triggerData,
        webhookUrl: this.webhookUrl
      });

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'campaign_trigger',
          campaignId,
          data: triggerData,
          timestamp: new Date().toISOString(),
          source: 'saira_frontend'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      console.log('✅ Campanha disparada com sucesso no n8n:', result);
      
      return {
        success: true,
        message: 'Campanha disparada no n8n com sucesso',
        executionId: result.executionId,
        ...result
      };

    } catch (error) {
      console.error('❌ Erro ao disparar campanha no n8n:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Falha ao disparar campanha no n8n'
      };
    }
  }

  /**
   * Verifica se o n8n está configurado e acessível
   */
  async healthCheck(): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Mesmo que retorne 404, significa que o n8n está acessível
      return response.status === 404 || response.ok;
    } catch (error) {
      console.error('❌ N8n não está acessível:', error);
      return false;
    }
  }

  /**
   * Retorna as configurações atuais do n8n
   */
  getConfig() {
    return {
      webhookUrl: this.webhookUrl,
      apiUrl: this.apiUrl,
      isConfigured: !!this.webhookUrl
    };
  }
}

// Instância singleton do serviço
export const n8nService = new N8nService();

// Hook para usar o serviço no React
export const useN8nService = () => {
  return n8nService;
};

export default N8nService;