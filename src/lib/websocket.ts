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
    fromMe: boolean;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
  pushName?: string;
  messageType: string;
}

interface ConnectionUpdate {
  instance: string;
  state: 'open' | 'close' | 'connecting';
  statusReason?: number;
}

interface QRCodeUpdate {
  instance: string;
  qrcode: string;
  base64?: string;
}

interface PresenceUpdate {
  id: string;
  presences: {
    [key: string]: {
      lastKnownPresence: 'available' | 'unavailable' | 'composing' | 'recording' | 'paused';
      lastSeen?: number;
    };
  };
}

interface ContactUpdate {
  id: string;
  name?: string;
  notify?: string;
  verifiedName?: string;
  imgUrl?: string;
  status?: string;
}

interface ChatUpdate {
  id: string;
  name?: string;
  unreadCount?: number;
  conversationTimestamp?: number;
  archived?: boolean;
  pinned?: number;
}

interface GroupUpdate {
  id: string;
  subject?: string;
  subjectOwner?: string;
  subjectTime?: number;
  size?: number;
  creation?: number;
  owner?: string;
  desc?: string;
  descId?: string;
  restrict?: boolean;
  announce?: boolean;
  participants?: Array<{
    id: string;
    admin?: 'admin' | 'superadmin' | null;
  }>;
}

export class EvolutionSocket {
  private socket: Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private connectionHandlers: ((status: ConnectionUpdate) => void)[] = [];
  private qrCodeHandlers: ((qr: QRCodeUpdate) => void)[] = [];
  private presenceHandlers: ((presence: PresenceUpdate) => void)[] = [];
  private contactHandlers: ((contact: ContactUpdate) => void)[] = [];
  private chatHandlers: ((chat: ChatUpdate) => void)[] = [];
  private groupHandlers: ((group: GroupUpdate) => void)[] = [];
  private callHandlers: ((call: any) => void)[] = [];
  private typebotHandlers: ((typebot: any) => void)[] = [];
  private labelHandlers: ((label: any) => void)[] = [];
  private instanceName: string | null = null;
  private isGlobalMode: boolean = false;
  private apiUrl: string;
  private apiKey: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

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

    console.log(`🔌 Conectando WebSocket Evolution API: ${url}`);
    console.log(`📡 Modo: ${this.isGlobalMode ? 'Global' : 'Tradicional'}`);
    console.log(`🏷️ Instância: ${this.instanceName || 'N/A (Global)'}`);

    this.socket = io(url, {
      transports: ['websocket'],
      // Autenticação conforme documentação Evolution API
      query: {
        apikey: this.apiKey
      },
      extraHeaders: {
        'apikey': this.apiKey
      },
      // Configurações de reconexão
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log(`✅ WebSocket conectado - Modo: ${this.isGlobalMode ? 'Global' : 'Tradicional'}`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ WebSocket desconectado: ${reason}`);
      
      if (reason === 'io server disconnect') {
        // Reconectar se o servidor desconectou
        this.socket?.connect();
      }
    });

    // === EVENTOS PRINCIPAIS CONFORME DOCUMENTAÇÃO EVOLUTION API ===

    // 1. EVENTOS DE INSTÂNCIA
    this.socket.on('APPLICATION_STARTUP', (data: any) => {
      console.log('🚀 APPLICATION_STARTUP:', data);
    });

    this.socket.on('INSTANCE_CREATE', (data: any) => {
      console.log('🆕 INSTANCE_CREATE:', data);
    });

    this.socket.on('INSTANCE_DELETE', (data: any) => {
      console.log('🗑️ INSTANCE_DELETE:', data);
    });

    this.socket.on('REMOVE_INSTANCE', (data: any) => {
      console.log('❌ REMOVE_INSTANCE:', data);
    });

    this.socket.on('LOGOUT_INSTANCE', (data: any) => {
      console.log('🚪 LOGOUT_INSTANCE:', data);
    });

    // 2. EVENTOS DE CONEXÃO E QR CODE
    this.socket.on('QRCODE_UPDATED', (data: QRCodeUpdate) => {
      console.log('📱 QRCODE_UPDATED:', data);
      this.qrCodeHandlers.forEach(handler => handler(data));
    });

    this.socket.on('CONNECTION_UPDATE', (data: ConnectionUpdate) => {
      console.log('🔗 CONNECTION_UPDATE:', data);
      this.connectionHandlers.forEach(handler => handler(data));
    });

    this.socket.on('STATUS_INSTANCE', (data: any) => {
      console.log('📊 STATUS_INSTANCE:', data);
    });

    this.socket.on('CREDS_UPDATE', (data: any) => {
      console.log('🔐 CREDS_UPDATE:', data);
    });

    // 3. EVENTOS DE MENSAGENS
    this.socket.on('MESSAGES_SET', (data: EvolutionMessage[]) => {
      console.log('📝 MESSAGES_SET:', data);
      // Processar mensagens iniciais se necessário
    });

    this.socket.on('MESSAGES_UPSERT', (data: EvolutionMessage[]) => {
      console.log('📨 MESSAGES_UPSERT:', data);
      this.handleMessagesUpsert(data);
    });

    this.socket.on('MESSAGES_EDITED', (data: EvolutionMessage[]) => {
      console.log('✏️ MESSAGES_EDITED:', data);
      this.handleMessagesUpsert(data); // Tratar como upsert
    });

    this.socket.on('MESSAGES_UPDATE', (data: any[]) => {
      console.log('🔄 MESSAGES_UPDATE:', data);
      this.handleMessagesUpdate(data);
    });

    this.socket.on('MESSAGES_DELETE', (data: any[]) => {
      console.log('🗑️ MESSAGES_DELETE:', data);
      this.handleMessagesDelete(data);
    });

    this.socket.on('SEND_MESSAGE', (data: EvolutionMessage) => {
      console.log('📤 SEND_MESSAGE:', data);
      // Tratar como mensagem enviada
    });

    this.socket.on('MESSAGING_HISTORY_SET', (data: any) => {
      console.log('📚 MESSAGING_HISTORY_SET:', data);
    });

    // 4. EVENTOS DE CONTATOS
    this.socket.on('CONTACTS_SET', (data: ContactUpdate[]) => {
      console.log('👥 CONTACTS_SET:', data);
    });

    this.socket.on('CONTACTS_UPSERT', (data: ContactUpdate[]) => {
      console.log('👤 CONTACTS_UPSERT:', data);
      data.forEach(contact => {
        this.contactHandlers.forEach(handler => handler(contact));
      });
    });

    this.socket.on('CONTACTS_UPDATE', (data: ContactUpdate[]) => {
      console.log('🔄 CONTACTS_UPDATE:', data);
      data.forEach(contact => {
        this.contactHandlers.forEach(handler => handler(contact));
      });
    });

    // 5. EVENTOS DE CHATS
    this.socket.on('CHATS_SET', (data: ChatUpdate[]) => {
      console.log('💬 CHATS_SET:', data);
    });

    this.socket.on('CHATS_UPDATE', (data: ChatUpdate[]) => {
      console.log('🔄 CHATS_UPDATE:', data);
      data.forEach(chat => {
        this.chatHandlers.forEach(handler => handler(chat));
      });
    });

    this.socket.on('CHATS_UPSERT', (data: ChatUpdate[]) => {
      console.log('💬 CHATS_UPSERT:', data);
      data.forEach(chat => {
        this.chatHandlers.forEach(handler => handler(chat));
      });
    });

    this.socket.on('CHATS_DELETE', (data: any[]) => {
      console.log('🗑️ CHATS_DELETE:', data);
    });

    // 6. EVENTOS DE GRUPOS
    this.socket.on('GROUPS_UPSERT', (data: GroupUpdate[]) => {
      console.log('👥 GROUPS_UPSERT:', data);
      data.forEach(group => {
        this.groupHandlers.forEach(handler => handler(group));
      });
    });

    this.socket.on('GROUPS_UPDATE', (data: GroupUpdate[]) => {
      console.log('🔄 GROUPS_UPDATE:', data);
      data.forEach(group => {
        this.groupHandlers.forEach(handler => handler(group));
      });
    });

    this.socket.on('GROUP_PARTICIPANTS_UPDATE', (data: any) => {
      console.log('👥 GROUP_PARTICIPANTS_UPDATE:', data);
    });

    // 7. EVENTOS DE PRESENÇA
    this.socket.on('PRESENCE_UPDATE', (data: PresenceUpdate) => {
      console.log('👀 PRESENCE_UPDATE:', data);
      this.presenceHandlers.forEach(handler => handler(data));
    });

    // 8. EVENTOS DE CHAMADAS
    this.socket.on('CALL', (data: any) => {
      console.log('📞 CALL:', data);
      this.callHandlers.forEach(handler => handler(data));
    });

    // 9. EVENTOS DE TYPEBOT
    this.socket.on('TYPEBOT_START', (data: any) => {
      console.log('🤖 TYPEBOT_START:', data);
      this.typebotHandlers.forEach(handler => handler(data));
    });

    this.socket.on('TYPEBOT_CHANGE_STATUS', (data: any) => {
      console.log('🔄 TYPEBOT_CHANGE_STATUS:', data);
      this.typebotHandlers.forEach(handler => handler(data));
    });

    // 10. EVENTOS DE LABELS
    this.socket.on('LABELS_EDIT', (data: any) => {
      console.log('🏷️ LABELS_EDIT:', data);
      this.labelHandlers.forEach(handler => handler(data));
    });

    this.socket.on('LABELS_ASSOCIATION', (data: any) => {
      console.log('🔗 LABELS_ASSOCIATION:', data);
      this.labelHandlers.forEach(handler => handler(data));
    });

    // Tratamento de erros melhorado
    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`❌ Erro de conexão WebSocket (tentativa ${this.reconnectAttempts}):`, error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🚫 Máximo de tentativas de reconexão atingido');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Erro WebSocket:', error);
    });
  }

  private handleMessagesUpsert(messages: EvolutionMessage[]) {
    messages.forEach(msg => {
      try {
        // Extrair conteúdo da mensagem
        let content = '';
        if (msg.message?.conversation) {
          content = msg.message.conversation;
        } else if (msg.message?.extendedTextMessage?.text) {
          content = msg.message.extendedTextMessage.text;
        }

        if (content && content.trim()) {
          const message: Message = {
            id: msg.key.id,
            content: content,
            sender: msg.key.fromMe ? 'pharmacy' : 'client',
            timestamp: new Date(msg.messageTimestamp * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          };
          
          console.log(`📩 Nova mensagem processada: ${msg.key.fromMe ? '📤 Enviada' : '📥 Recebida'} - ${content}`);
          this.messageHandlers.forEach(handler => handler(message));
        }
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
      }
    });
  }

  private handleMessagesUpdate(updates: any[]) {
    console.log('🔄 Processando atualizações de mensagens:', updates);
    // Implementar atualização de status de mensagens se necessário
  }

  private handleMessagesDelete(deletions: any[]) {
    console.log('🗑️ Processando exclusões de mensagens:', deletions);
    // Implementar exclusão de mensagens se necessário
  }

  // === HANDLERS PARA DIFERENTES TIPOS DE EVENTOS ===

  // Mensagens
  addMessageHandler(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: Message) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  // Conexão
  addConnectionHandler(handler: (status: ConnectionUpdate) => void) {
    this.connectionHandlers.push(handler);
  }

  // QR Code
  addQRCodeHandler(handler: (qr: QRCodeUpdate) => void) {
    this.qrCodeHandlers.push(handler);
  }

  // Presença
  addPresenceHandler(handler: (presence: PresenceUpdate) => void) {
    this.presenceHandlers.push(handler);
  }

  // Contatos
  addContactHandler(handler: (contact: ContactUpdate) => void) {
    this.contactHandlers.push(handler);
  }

  // Chats
  addChatHandler(handler: (chat: ChatUpdate) => void) {
    this.chatHandlers.push(handler);
  }

  // Grupos
  addGroupHandler(handler: (group: GroupUpdate) => void) {
    this.groupHandlers.push(handler);
  }

  // Chamadas
  addCallHandler(handler: (call: any) => void) {
    this.callHandlers.push(handler);
  }

  // Typebot
  addTypebotHandler(handler: (typebot: any) => void) {
    this.typebotHandlers.push(handler);
  }

  // Labels
  addLabelHandler(handler: (label: any) => void) {
    this.labelHandlers.push(handler);
  }

  // Envio via API REST (separado do WebSocket)
  async sendMessageViaAPI(content: string, number: string): Promise<boolean> {
    try {
      const endpoint = this.isGlobalMode 
        ? `/message/sendText/${this.instanceName}` 
        : `/message/sendText/${this.instanceName}`;
        
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify({
          number: number,
          text: content
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada via API:', result);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem via API:', error);
      return false;
    }
  }

  // Status da conexão
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Reconectar manualmente
  reconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando WebSocket Evolution API');
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

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