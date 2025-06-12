import { supabase } from '@/lib/supabase';
import { createEvolutionSocket } from '@/lib/websocket';
import { Message } from '@/components/chat/types';

class WhatsAppService {
  private static instance: WhatsAppService;
  private webSocket: ReturnType<typeof createEvolutionSocket> | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  public async connect(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Configurações do WhatsApp não encontradas');

      const { api_url, api_key, instance_name, global_mode } = data;

      if (!api_url || !api_key) {
        throw new Error('URL e chave da API são obrigatórias');
      }

      this.webSocket = createEvolutionSocket(
        api_url,
        api_key,
        {
          instanceName: instance_name,
          globalMode: global_mode
        }
      );

      await this.webSocket.connect();
      this.isConnected = true;
    } catch (error) {
      console.error('Erro ao conectar ao WhatsApp:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.webSocket) {
      await this.webSocket.disconnect();
      this.webSocket = null;
      this.isConnected = false;
    }
  }

  public async sendMessage(content: string, number: string): Promise<boolean> {
    if (!this.webSocket) {
      await this.connect();
    }

    if (this.webSocket) {
      return await this.webSocket.sendMessageViaAPI(content, number);
    }

    return false;
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const whatsAppService = WhatsAppService.getInstance();

export const getEvolutionConfig = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('api_url, api_key, instance_name, global_mode')
    .limit(1)
    .single();

  if (error) throw new Error(`Erro ao buscar configurações: ${error.message}`);
  
  const { api_url, api_key, instance_name, global_mode } = data;

  if (!api_url || !api_key) {
    throw new Error('Configurações da Evolution API não encontradas');
  }

  return {
    evolution_api_url: api_url,
    evolution_api_key: api_key,
    instance_name,
    global_mode
  };
}; 