interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName?: string;
}

interface SendMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation: string;
  };
  messageTimestamp: number;
  status: string;
}

interface InstanceInfo {
  instance: {
    instanceName: string;
    status: string;
  };
  hash: {
    apikey: string;
  };
  webhookUrl: string;
  events: string[];
}

export class EvolutionApiService {
  private config: EvolutionConfig;

  constructor(config: EvolutionConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.apiUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.config.apiKey,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição para ${url}:`, error);
      throw error;
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(number: string, text: string): Promise<SendMessageResponse> {
    const endpoint = `/message/sendText/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        number: number,
        text: text,
      }),
    });
  }

  // Criar instância
  async createInstance(instanceName: string, token?: string): Promise<InstanceInfo> {
    const endpoint = '/instance/create';
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        instanceName: instanceName,
        token: token,
      }),
    });
  }

  // Conectar instância
  async connectInstance(): Promise<any> {
    const endpoint = `/instance/connect/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'GET',
    });
  }

  // Obter status da instância
  async getInstanceStatus(): Promise<any> {
    const endpoint = `/instance/connectionState/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'GET',
    });
  }

  // Configurar webhook para a instância
  async setWebhook(webhookUrl: string, events: string[] = []): Promise<any> {
    const endpoint = `/webhook/${this.config.instanceName}`;
    
    const defaultEvents = [
      'QRCODE_UPDATED',
      'MESSAGES_UPSERT',
      'MESSAGES_UPDATE',
      'MESSAGES_DELETE',
      'CONNECTION_UPDATE'
    ];
    
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        url: webhookUrl,
        webhook_by_events: true,
        webhook_base64: false,
        events: events.length > 0 ? events : defaultEvents,
      }),
    });
  }

  // Obter QR Code
  async getQRCode(): Promise<{ base64: string }> {
    const endpoint = `/instance/qrcode/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'GET',
    });
  }

  // Listar conversas/chats
  async fetchChats(): Promise<any[]> {
    const endpoint = `/chat/fetchChats/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'GET',
    });
  }

  // Buscar mensagens de uma conversa
  async fetchMessages(remoteJid: string, limit: number = 50): Promise<any[]> {
    const endpoint = `/chat/fetchMessages/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        remoteJid: remoteJid,
        limit: limit,
      }),
    });
  }

  // Marcar mensagem como lida
  async markMessageAsRead(remoteJid: string, messageId: string): Promise<any> {
    const endpoint = `/chat/markMessageAsRead/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        remoteJid: remoteJid,
        messageId: messageId,
      }),
    });
  }

  // Verificar se número existe no WhatsApp
  async checkNumberExists(number: string): Promise<{ exists: boolean; jid: string }> {
    const endpoint = `/chat/whatsappNumbers/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        numbers: [number],
      }),
    });
  }

  // Deletar instância
  async deleteInstance(): Promise<any> {
    const endpoint = `/instance/delete/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  // Logout da instância
  async logoutInstance(): Promise<any> {
    const endpoint = `/instance/logout/${this.config.instanceName}`;
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }
}

// Factory function para criar instância do serviço
export const createEvolutionApiService = (config: EvolutionConfig): EvolutionApiService => {
  return new EvolutionApiService(config);
};

// Hook para usar o serviço no React
export const useEvolutionApi = (config: EvolutionConfig) => {
  return createEvolutionApiService(config);
}; 