import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  MessageSquare, 
  Users, 
  Phone, 
  QrCode, 
  Bot,
  Tag,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface EventConfig {
  enabled: boolean;
  description: string;
  category: 'messages' | 'connection' | 'contacts' | 'chats' | 'groups' | 'calls' | 'system' | 'bots' | 'labels';
  icon: React.ReactNode;
}

interface EventsSettings {
  [key: string]: boolean;
}

const EventsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventsSettings>({});

  // Configuração completa de eventos conforme documentação Evolution API
  const eventConfigs: Record<string, EventConfig> = {
    // EVENTOS DE INSTÂNCIA E SISTEMA
    'APPLICATION_STARTUP': {
      enabled: false,
      description: 'Notifica quando a aplicação inicia',
      category: 'system',
      icon: <Activity className="h-4 w-4" />
    },
    'INSTANCE_CREATE': {
      enabled: true,
      description: 'Notifica quando uma nova instância é criada',
      category: 'system',
      icon: <Activity className="h-4 w-4" />
    },
    'INSTANCE_DELETE': {
      enabled: true,
      description: 'Notifica quando uma instância é excluída',
      category: 'system',
      icon: <Activity className="h-4 w-4" />
    },
    'LOGOUT_INSTANCE': {
      enabled: true,
      description: 'Notifica quando uma instância faz logout',
      category: 'system',
      icon: <Activity className="h-4 w-4" />
    },

    // EVENTOS DE CONEXÃO E QR CODE
    'QRCODE_UPDATED': {
      enabled: true,
      description: 'Envia o QR code em formato base64 para escaneamento',
      category: 'connection',
      icon: <QrCode className="h-4 w-4" />
    },
    'CONNECTION_UPDATE': {
      enabled: true,
      description: 'Informa o status da conexão do WhatsApp',
      category: 'connection',
      icon: <Activity className="h-4 w-4" />
    },
    'STATUS_INSTANCE': {
      enabled: true,
      description: 'Informa mudanças no status da instância',
      category: 'connection',
      icon: <Activity className="h-4 w-4" />
    },
    'CREDS_UPDATE': {
      enabled: false,
      description: 'Notifica quando as credenciais são atualizadas',
      category: 'connection',
      icon: <Activity className="h-4 w-4" />
    },

    // EVENTOS DE MENSAGENS
    'MESSAGES_SET': {
      enabled: false,
      description: 'Envia uma lista de todas as mensagens carregadas no WhatsApp (ocorre apenas uma vez)',
      category: 'messages',
      icon: <MessageSquare className="h-4 w-4" />
    },
    'MESSAGES_UPSERT': {
      enabled: true,
      description: 'Notifica quando uma mensagem é recebida ou enviada',
      category: 'messages',
      icon: <MessageSquare className="h-4 w-4" />
    },
    'MESSAGES_UPDATE': {
      enabled: true,
      description: 'Informa quando uma mensagem é atualizada (status de leitura, etc.)',
      category: 'messages',
      icon: <MessageSquare className="h-4 w-4" />
    },
    'MESSAGES_DELETE': {
      enabled: true,
      description: 'Informa quando uma mensagem é excluída',
      category: 'messages',
      icon: <MessageSquare className="h-4 w-4" />
    },
    'SEND_MESSAGE': {
      enabled: true,
      description: 'Notifica quando uma mensagem é enviada',
      category: 'messages',
      icon: <MessageSquare className="h-4 w-4" />
    },

    // EVENTOS DE CONTATOS
    'CONTACTS_SET': {
      enabled: false,
      description: 'Executa o carregamento inicial de todos os contatos (ocorre apenas uma vez)',
      category: 'contacts',
      icon: <Users className="h-4 w-4" />
    },
    'CONTACTS_UPSERT': {
      enabled: true,
      description: 'Recarrega todos os contatos com informações adicionais',
      category: 'contacts',
      icon: <Users className="h-4 w-4" />
    },
    'CONTACTS_UPDATE': {
      enabled: true,
      description: 'Informa quando um contato é atualizado',
      category: 'contacts',
      icon: <Users className="h-4 w-4" />
    },

    // EVENTOS DE PRESENÇA
    'PRESENCE_UPDATE': {
      enabled: true,
      description: 'Informa se o usuário está online, digitando, gravando ou última visualização',
      category: 'contacts',
      icon: <Users className="h-4 w-4" />
    },

    // EVENTOS DE CHATS
    'CHATS_SET': {
      enabled: false,
      description: 'Envia uma lista de todos os chats carregados (ocorre apenas uma vez)',
      category: 'chats',
      icon: <MessageSquare className="h-4 w-4" />
    },
    'CHATS_UPDATE': {
      enabled: true,
      description: 'Informa quando um chat é atualizado',
      category: 'chats',
      icon: <MessageSquare className="h-4 w-4" />
    },
    'CHATS_UPSERT': {
      enabled: true,
      description: 'Envia informações de novos chats',
      category: 'chats',
      icon: <MessageSquare className="h-4 w-4" />
    },
    'CHATS_DELETE': {
      enabled: true,
      description: 'Notifica quando um chat é excluído',
      category: 'chats',
      icon: <MessageSquare className="h-4 w-4" />
    },

    // EVENTOS DE GRUPOS
    'GROUPS_UPSERT': {
      enabled: true,
      description: 'Notifica quando um grupo é criado ou atualizado',
      category: 'groups',
      icon: <Users className="h-4 w-4" />
    },
    'GROUPS_UPDATE': {
      enabled: true,
      description: 'Notifica quando um grupo tem suas informações atualizadas',
      category: 'groups',
      icon: <Users className="h-4 w-4" />
    },
    'GROUP_PARTICIPANTS_UPDATE': {
      enabled: true,
      description: 'Notifica ações envolvendo participantes: add, remove, promote, demote',
      category: 'groups',
      icon: <Users className="h-4 w-4" />
    },

    // EVENTOS DE CHAMADAS
    'CALL': {
      enabled: true,
      description: 'Notifica quando há uma chamada (voz ou vídeo)',
      category: 'calls',
      icon: <Phone className="h-4 w-4" />
    },

    // EVENTOS DE TYPEBOT
    'TYPEBOT_START': {
      enabled: false,
      description: 'Notifica quando um typebot inicia',
      category: 'bots',
      icon: <Bot className="h-4 w-4" />
    },
    'TYPEBOT_CHANGE_STATUS': {
      enabled: false,
      description: 'Notifica quando o status do typebot muda',
      category: 'bots',
      icon: <Bot className="h-4 w-4" />
    },

    // EVENTOS DE LABELS
    'LABELS_EDIT': {
      enabled: false,
      description: 'Notifica quando etiquetas são editadas',
      category: 'labels',
      icon: <Tag className="h-4 w-4" />
    },
    'LABELS_ASSOCIATION': {
      enabled: false,
      description: 'Notifica quando etiquetas são associadas/desassociadas',
      category: 'labels',
      icon: <Tag className="h-4 w-4" />
    },

    // EVENTOS ESPECIAIS
    'NEW_TOKEN': {
      enabled: false,
      description: 'Notifica quando o token (JWT) é atualizado',
      category: 'system',
      icon: <Activity className="h-4 w-4" />
    }
  };

  // Agrupar eventos por categoria
  const eventsByCategory = Object.entries(eventConfigs).reduce((acc, [eventName, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ name: eventName, ...config });
    return acc;
  }, {} as Record<string, Array<{ name: string } & EventConfig>>);

  const categoryNames = {
    system: 'Sistema e Instâncias',
    connection: 'Conexão e QR Code',
    messages: 'Mensagens',
    contacts: 'Contatos e Presença',
    chats: 'Conversas',
    groups: 'Grupos',
    calls: 'Chamadas',
    bots: 'Chatbots',
    labels: 'Etiquetas'
  };

  const categoryIcons = {
    system: <Activity className="h-5 w-5" />,
    connection: <QrCode className="h-5 w-5" />,
    messages: <MessageSquare className="h-5 w-5" />,
    contacts: <Users className="h-5 w-5" />,
    chats: <MessageSquare className="h-5 w-5" />,
    groups: <Users className="h-5 w-5" />,
    calls: <Phone className="h-5 w-5" />,
    bots: <Bot className="h-5 w-5" />,
    labels: <Tag className="h-5 w-5" />
  };

  // Carregar configurações existentes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettingsId(data.id);
          
          // Carregar eventos salvos ou usar padrões
          const savedEvents = data.webhook_events ? JSON.parse(data.webhook_events) : {};
          const defaultEvents: EventsSettings = {};
          
          Object.entries(eventConfigs).forEach(([eventName, config]) => {
            defaultEvents[eventName] = savedEvents[eventName] !== undefined 
              ? savedEvents[eventName] 
              : config.enabled;
          });
          
          setEvents(defaultEvents);
        } else {
          // Usar configurações padrão se não houver dados salvos
          const defaultEvents: EventsSettings = {};
          Object.entries(eventConfigs).forEach(([eventName, config]) => {
            defaultEvents[eventName] = config.enabled;
          });
          setEvents(defaultEvents);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações de eventos.",
          variant: "destructive"
        });
      }
    };

    fetchSettings();
  }, [toast]);

  const handleEventToggle = (eventName: string, enabled: boolean) => {
    setEvents(prev => ({
      ...prev,
      [eventName]: enabled
    }));
  };

  const handleCategoryToggle = (category: string, enabled: boolean) => {
    const categoryEvents = eventsByCategory[category] || [];
    const updates: EventsSettings = {};
    
    categoryEvents.forEach(event => {
      updates[event.name] = enabled;
    });
    
    setEvents(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const settingsData = {
        webhook_events: JSON.stringify(events),
        updated_at: new Date().toISOString()
      };

      let result;
      if (settingsId) {
        result = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', settingsId);
      } else {
        result = await supabase
          .from('settings')
          .insert([settingsData])
          .select()
          .single();
          
        if (result.data) {
          setSettingsId(result.data.id);
        }
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso!",
        description: "Configurações de eventos atualizadas com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enabledCount = Object.values(events).filter(Boolean).length;
  const totalCount = Object.keys(eventConfigs).length;

  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">
          Configuração de Eventos WebSocket
        </CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Configure quais eventos da Evolution API você deseja monitorar via WebSocket
        </CardDescription>
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className="text-sm">
            {enabledCount} de {totalCount} eventos habilitados
          </Badge>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Baseado na documentação oficial Evolution API</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ScrollArea className="h-96 w-full pr-4">
            <div className="space-y-6">
              {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <h3 className="font-medium text-pharmacy-text1">
                        {categoryNames[category as keyof typeof categoryNames]}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {categoryEvents.filter(event => events[event.name]).length}/{categoryEvents.length}
                      </Badge>
                    </div>
                    <Switch
                      checked={categoryEvents.every(event => events[event.name])}
                      onCheckedChange={(checked) => handleCategoryToggle(category, checked)}
                      className="data-[state=checked]:bg-pharmacy-accent"
                    />
                  </div>
                  
                  <div className="ml-7 space-y-2">
                    {categoryEvents.map((event) => (
                      <div key={event.name} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-3 flex-1">
                          {event.icon}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={event.name} className="font-medium text-sm text-pharmacy-text1">
                                {event.name}
                              </Label>
                              {event.enabled && (
                                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                  Recomendado
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-pharmacy-text2 mt-1">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={event.name}
                          checked={events[event.name] || false}
                          onCheckedChange={(checked) => handleEventToggle(event.name, checked)}
                          className="data-[state=checked]:bg-pharmacy-accent ml-4"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {Object.keys(eventsByCategory).indexOf(category) < Object.keys(eventsByCategory).length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Informações importantes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-800 mb-1">Informações Importantes:</h4>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Eventos marcados como "Recomendado" são essenciais para o funcionamento básico</li>
                  <li>• Eventos "_SET" ocorrem apenas uma vez no carregamento inicial</li>
                  <li>• Eventos de TYPEBOT e LABELS são opcionais e podem impactar performance</li>
                  <li>• Para aplicar as mudanças, é necessário reconectar o WebSocket</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações de Eventos'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventsTab; 