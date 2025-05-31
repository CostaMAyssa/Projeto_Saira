import { Message } from '@/components/chat/types';
import { io, Socket } from 'socket.io-client';

interface EvolutionEvent {
  event: string;
  data: any;
}

interface EvolutionMessage {
  key: {
    id: string;
    remoteJid: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
  status: number;
}

export class EvolutionSocket {
  private socket: Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private instanceName: string | null = null;
  private isGlobalMode: boolean = false;
  private apiUrl: string;
  private apiKey: string;

  constructor(
    apiUrl: string,
    apiKey: string,
    options?: {
      instanceName?: string;
      globalMode?: boolean;
    }
  ) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.instanceName = options?.instanceName || null;
    this.isGlobalMode = options?.globalMode || false;
  }

  connect() {
    // Monta a URL baseada no modo (global ou tradicional)
    const url = this.isGlobalMode
      ? this.apiUrl
      : `${this.apiUrl.replace(/\/$/, '')}/${this.instanceName}`;

    this.socket = io(url, {
      transports: ['websocket'],
      auth: {
        apiKey: this.apiKey
      }
    });

    this.socket.on('connect', () => {
      console.log(`Socket.io conectado com sucesso - Modo: ${this.isGlobalMode ? 'Global' : 'Tradicional'}`);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.io desconectado');
    });

    this.socket.on('MESSAGES_UPSERT', (data: EvolutionMessage[]) => {
      this.handleMessagesUpsert(data);
    });

    this.socket.on('MESSAGES_UPDATE', (data: any[]) => {
      this.handleMessagesUpdate(data);
    });

    this.socket.on('MESSAGES_DELETE', (data: any[]) => {
      this.handleMessagesDelete(data);
    });

    // Outros eventos podem ser adicionados conforme necessário
  }

  private handleMessagesUpsert(messages: EvolutionMessage[]) {
    messages.forEach(msg => {
      if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
        const content = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const message: Message = {
          id: msg.key.id,
          content: content,
          sender: msg.key.remoteJid.includes('@g.us') ? 'client' : 'pharmacy',
          timestamp: new Date(msg.messageTimestamp * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        };
        this.messageHandlers.forEach(handler => handler(message));
      }
    });
  }

  private handleMessagesUpdate(updates: any[]) {
    console.log('Atualizações de mensagens:', updates);
  }

  private handleMessagesDelete(deletions: any[]) {
    console.log('Mensagens deletadas:', deletions);
  }

  addMessageHandler(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: Message) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  sendMessage(message: Message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('SEND_MESSAGE', {
        instance: this.instanceName,
        message: {
          key: {
            remoteJid: message.sender === 'pharmacy' ? 'client' : 'pharmacy',
          },
          message: {
            conversation: message.content
          },
          messageTimestamp: Date.now()
        }
      });
    } else {
      console.error('Socket.io não está conectado');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Factory para criar instâncias do EvolutionSocket
export const createEvolutionSocket = (
  apiUrl: string,
  apiKey: string,
  options?: {
    instanceName?: string;
    globalMode?: boolean;
  }
) => {
  return new EvolutionSocket(apiUrl, apiKey, options);
}; 