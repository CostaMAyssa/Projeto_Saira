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

      const { evolution_api_url, evolution_api_key, instance_name, global_mode } = data;

      if (!evolution_api_url || !evolution_api_key) {
        throw new Error('URL e chave da API são obrigatórias');
      }

      this.webSocket = createEvolutionSocket(
        evolution_api_url,
        evolution_api_key,
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

  public async sendMessage(to: string, content: string): Promise<void> {
    if (!this.webSocket || !this.isConnected) {
      throw new Error('WebSocket não está conectado');
    }

    try {
      const message: Message = {
        id: Date.now().toString(),
        content,
        sender: 'pharmacy',
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      await this.webSocket.sendMessage(message);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const whatsAppService = WhatsAppService.getInstance(); 