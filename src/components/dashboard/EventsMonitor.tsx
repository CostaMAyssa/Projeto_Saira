import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  MessageSquare, 
  Users, 
  Phone, 
  QrCode, 
  Settings,
  Wifi,
  WifiOff,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { createEvolutionSocket } from '@/lib/websocket';
import { supabase } from '@/lib/supabase';

interface EventLog {
  id: string;
  type: string;
  data: unknown;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface EventStats {
  messages: number;
  connections: number;
  qrCodes: number;
  calls: number;
  errors: number;
}

const EventsMonitor: React.FC = () => {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [stats, setStats] = useState<EventStats>({
    messages: 0,
    connections: 0,
    qrCodes: 0,
    calls: 0,
    errors: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [filters, setFilters] = useState({
    messages: true,
    connections: true,
    qrCodes: true,
    calls: true,
    contacts: true,
    groups: true,
    presence: true,
    typebot: true,
    labels: true
  });
  const wsRef = useRef<ReturnType<typeof createEvolutionSocket> | null>(null);
  const maxEvents = 1000; // Máximo de eventos em memória

  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  const initializeWebSocket = async () => {
    try {
      // Buscar configurações da Evolution API
      const { data, error } = await supabase
        .from('settings')
        .select('api_url, api_key, instance_name, global_mode')
        .limit(1)
        .single();

      if (error) {
        addEvent('ERROR', 'Erro ao buscar configurações da Evolution API', 'error');
        return;
      }

      if (data) {
        const websocket = createEvolutionSocket(
          data.api_url || 'https://evoapi.insignemarketing.com.br',
          data.api_key || '33cf7bf9876391ff485115742bdb149a',
          {
            instanceName: data.instance_name,
            globalMode: data.global_mode !== undefined ? data.global_mode : true
          }
        );

        // === HANDLERS PARA TODOS OS EVENTOS EVOLUTION API ===

        // 1. EVENTOS DE MENSAGENS
        websocket.addMessageHandler((message) => {
          if (filters.messages) {
            addEvent('MESSAGES_UPSERT', message, 'info');
            updateStats('messages');
          }
        });

        // 2. EVENTOS DE CONEXÃO
        websocket.addConnectionHandler((connection) => {
          const severity = connection.state === 'open' ? 'success' : 
                          connection.state === 'close' ? 'error' : 'warning';
          
          if (filters.connections) {
            addEvent('CONNECTION_UPDATE', connection, severity);
            updateStats('connections');
          }
          
          setIsConnected(connection.state === 'open');
        });

        // 3. EVENTOS DE QR CODE
        websocket.addQRCodeHandler((qr) => {
          if (filters.qrCodes) {
            addEvent('QRCODE_UPDATED', qr, 'warning');
            updateStats('qrCodes');
          }
        });

        // 4. EVENTOS DE CONTATOS
        websocket.addContactHandler((contact) => {
          if (filters.contacts) {
            addEvent('CONTACTS_UPDATE', contact, 'info');
          }
        });

        // 5. EVENTOS DE GRUPOS
        websocket.addGroupHandler((group) => {
          if (filters.groups) {
            addEvent('GROUPS_UPDATE', group, 'info');
          }
        });

        // 6. EVENTOS DE PRESENÇA
        websocket.addPresenceHandler((presence) => {
          if (filters.presence) {
            addEvent('PRESENCE_UPDATE', presence, 'info');
          }
        });

        // 7. EVENTOS DE CHAMADAS
        websocket.addCallHandler((call) => {
          if (filters.calls) {
            addEvent('CALL', call, 'warning');
            updateStats('calls');
          }
        });

        // 8. EVENTOS DE TYPEBOT
        websocket.addTypebotHandler((typebot) => {
          if (filters.typebot) {
            addEvent('TYPEBOT_EVENT', typebot, 'info');
          }
        });

        // 9. EVENTOS DE LABELS
        websocket.addLabelHandler((label) => {
          if (filters.labels) {
            addEvent('LABELS_EVENT', label, 'info');
          }
        });

        wsRef.current = websocket;
        addEvent('SYSTEM', 'WebSocket inicializado com sucesso', 'success');
      }
    } catch (error) {
      console.error('Erro ao inicializar WebSocket:', error);
      addEvent('ERROR', `Erro ao inicializar WebSocket: ${error}`, 'error');
      updateStats('errors');
    }
  };

  const addEvent = (type: string, data: unknown, severity: EventLog['severity']) => {
    const newEvent: EventLog = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: new Date(),
      severity
    };

    setEvents(prev => {
      const updated = [newEvent, ...prev];
      // Manter apenas os últimos eventos para performance
      return updated.slice(0, maxEvents);
    });
  };

  const updateStats = (type: keyof EventStats) => {
    setStats(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const clearEvents = () => {
    setEvents([]);
    setStats({
      messages: 0,
      connections: 0,
      qrCodes: 0,
      calls: 0,
      errors: 0
    });
    addEvent('SYSTEM', 'Log de eventos limpo', 'info');
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      // Pausar monitoramento
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
      setIsConnected(false);
      addEvent('SYSTEM', 'Monitoramento pausado', 'warning');
    } else {
      // Iniciar monitoramento
      initializeWebSocket();
      addEvent('SYSTEM', 'Monitoramento iniciado', 'success');
    }
    setIsMonitoring(!isMonitoring);
  };

  const connectWebSocket = () => {
    if (wsRef.current && !isConnected) {
      wsRef.current.connect();
      setIsMonitoring(true);
      addEvent('SYSTEM', 'Tentando reconectar WebSocket', 'info');
    }
  };

  const getEventIcon = (type: string) => {
    if (type.includes('MESSAGE')) return <MessageSquare className="h-4 w-4" />;
    if (type.includes('CONNECTION') || type.includes('STATUS')) return isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
    if (type.includes('QRCODE')) return <QrCode className="h-4 w-4" />;
    if (type.includes('CALL')) return <Phone className="h-4 w-4" />;
    if (type.includes('CONTACT') || type.includes('GROUP')) return <Users className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatEventData = (data: unknown) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      // Mostrar apenas campos importantes para não sobrecarregar
      const obj = data as Record<string, unknown>;
      if (obj.content) return String(obj.content);
      if (obj.state) return `Estado: ${obj.state}`;
      if (obj.instance) return `Instância: ${obj.instance}`;
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <div className="space-y-6">
      {/* Header com Status e Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              Status: {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitorando' : 'Pausado'}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={connectWebSocket}
            disabled={isConnected}
          >
            <Wifi className="h-4 w-4 mr-2" />
            Conectar
          </Button>
          
          <Button
            variant={isMonitoring ? "secondary" : "default"}
            size="sm"
            onClick={toggleMonitoring}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearEvents}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-bold">{stats.messages}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mensagens</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-lg font-bold">{stats.connections}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Conexões</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <QrCode className="h-4 w-4 text-yellow-500" />
              <span className="text-lg font-bold">{stats.qrCodes}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">QR Codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Phone className="h-4 w-4 text-purple-500" />
              <span className="text-lg font-bold">{stats.calls}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Chamadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-lg font-bold">{stats.errors}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Erros</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Eventos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros de Eventos</CardTitle>
          <CardDescription>
            Selecione quais tipos de eventos você deseja monitorar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(filters).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, [key]: checked }))
                  }
                />
                <Label htmlFor={key} className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Log de Eventos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Log de Eventos em Tempo Real</CardTitle>
          <CardDescription>
            Monitoramento de todos os eventos da Evolution API ({events.length}/{maxEvents} eventos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-lg p-4">
            {events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum evento registrado ainda</p>
                <p className="text-xs mt-1">
                  {isMonitoring ? 'Aguardando eventos...' : 'Inicie o monitoramento para ver eventos'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={event.id}>
                    <div className={`p-3 rounded-lg border ${getSeverityColor(event.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          {getEventIcon(event.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{event.type}</span>
                              <Badge variant="outline" className="text-xs">
                                {event.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 break-all">
                              {formatEventData(event.data)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {event.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {index < events.length - 1 && <Separator className="my-1" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsMonitor; 