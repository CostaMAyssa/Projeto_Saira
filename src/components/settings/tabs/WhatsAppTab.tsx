import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MessageSquare, Settings, Plus, Trash2, Wifi, WifiOff, Star, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/contexts/SupabaseContext';
import { createEvolutionApiService } from '@/services/evolutionApi';

interface WhatsAppInstance {
  id: string;
  evolution_instance_name: string;
  api_url: string;
  api_key: string;
  global_mode: boolean;
  instance_status: 'connected' | 'disconnected' | 'connecting';
  last_connection: string | null;
  is_primary: boolean;
  created_at: string;
}

const WhatsAppTab = () => {
  const { toast } = useToast();
  const { user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [primaryInstance, setPrimaryInstance] = useState<any>(null);
  const [allInstances, setAllInstances] = useState<WhatsAppInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<WhatsAppInstance | null>(null);
  
  const [formData, setFormData] = useState({
    evolutionApiUrl: 'https://evolution.codegrana.com.br',
    evolutionApiKey: '',
    instanceName: '',
    globalMode: true
  });

  const [modalFormData, setModalFormData] = useState({
    instanceName: '',
    apiUrl: 'https://evolution.codegrana.com.br',
    apiKey: '',
    globalMode: true,
    isPrimary: false
  });

  // Carregar instância principal e todas as instâncias do usuário
  useEffect(() => {
    const fetchInstances = async () => {
      if (!user) return;

      try {
        // Buscar todas as instâncias
        const { data: allData, error: allError } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true });

        if (allError) throw allError;
        setAllInstances(allData || []);

        // Buscar instância principal
        const { data: primaryData, error: primaryError } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();

        if (primaryError && primaryError.code !== 'PGRST116') {
          throw primaryError;
        }

        if (primaryData) {
          setPrimaryInstance(primaryData);
          setFormData({
            evolutionApiUrl: primaryData.api_url || '',
            evolutionApiKey: primaryData.api_key || '',
            instanceName: primaryData.evolution_instance_name || '',
            globalMode: primaryData.global_mode || false
          });
        }
      } catch (error) {
        console.error('Erro ao carregar instâncias:', error);
      }
    };

    fetchInstances();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // Dados a serem salvos
      const settingsData = {
        user_id: user.id,
        api_url: formData.evolutionApiUrl,
        api_key: formData.evolutionApiKey,
        evolution_instance_name: formData.instanceName,
        global_mode: formData.globalMode,
        is_primary: true,
        instance_status: 'disconnected'
      };

      if (primaryInstance) {
        const { error } = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', primaryInstance.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert(settingsData);
        
        if (error) throw error;
      }

      // 🔧 CONFIGURAR WEBHOOK AUTOMATICAMENTE
      try {
        console.log('🔗 Configurando webhook automaticamente...');
        
        // URL correta do webhook receiver
        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver`;
        
        // Configurar via API REST diretamente (mais confiável)
        const webhookResponse = await fetch(`${formData.evolutionApiUrl}/webhook/set/${formData.instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': formData.evolutionApiKey
          },
          body: JSON.stringify({
            webhook: {
              enabled: true,
              url: webhookUrl,
              byEvents: true,
              base64: false,
              events: [
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE',
                'MESSAGES_DELETE',
                'CONNECTION_UPDATE',
                'QRCODE_UPDATED'
              ]
            }
          })
        });

        if (webhookResponse.ok) {
          console.log('✅ Webhook configurado com sucesso!');
          toast({
            title: "Sucesso!",
            description: "Configurações salvas e webhook configurado automaticamente. Agora você receberá mensagens!",
            variant: "default"
          });
        } else {
          throw new Error(`HTTP ${webhookResponse.status}`);
        }
      } catch (webhookError) {
        console.error('⚠️ Erro ao configurar webhook:', webhookError);
        toast({
          title: "Configurações salvas",
          description: "Configurações salvas, mas houve um problema ao configurar o webhook. Use o botão 'Webhook' para configurar manualmente.",
          variant: "default"
        });
      }
      
      // Recarregar instâncias
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para configurar webhook manualmente
  const configureWebhook = async (instance: WhatsAppInstance) => {
    setLoading(true);
    try {
      const evolutionApi = createEvolutionApiService({
        apiUrl: instance.api_url,
        apiKey: instance.api_key,
        instanceName: instance.evolution_instance_name,
        globalMode: instance.global_mode,
        webhookUrl: '',
        events: []
      });

      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver`;
      const events = [
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE', 
        'MESSAGES_DELETE',
        'CONNECTION_UPDATE',
        'QRCODE_UPDATED'
      ];

      await evolutionApi.setWebhook(webhookUrl, events);
      
      toast({
        title: "Sucesso!",
        description: "Webhook configurado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível configurar o webhook.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para testar a conexão com a Evolution API
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${formData.evolutionApiUrl}/instance/connectionState/${formData.instanceName}`, {
        method: 'GET',
        headers: { 
          'apikey': formData.evolutionApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Atualizar status no banco se há instância principal
        if (primaryInstance) {
          await supabase
            .from('settings')
            .update({ 
              instance_status: 'connected',
              last_connection: new Date().toISOString()
            })
            .eq('id', primaryInstance.id);
        }
        
        toast({
          title: "Conexão bem-sucedida!",
          description: `Status: ${data.instance?.state || 'Conectado'}`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      
      // Atualizar status como desconectado
      if (primaryInstance) {
        await supabase
          .from('settings')
          .update({ instance_status: 'disconnected' })
          .eq('id', primaryInstance.id);
      }
      
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar à Evolution API. Verifique as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar múltiplas instâncias
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const instanceData = {
        user_id: user.id,
        evolution_instance_name: modalFormData.instanceName,
        api_url: modalFormData.apiUrl,
        api_key: modalFormData.apiKey,
        global_mode: modalFormData.globalMode,
        is_primary: modalFormData.isPrimary,
        instance_status: 'disconnected'
      };

      if (editingInstance) {
        // Atualizar instância existente
        const { error } = await supabase
          .from('settings')
          .update(instanceData)
          .eq('id', editingInstance.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Instância atualizada com sucesso.",
        });
      } else {
        // Criar nova instância
        const { error } = await supabase
          .from('settings')
          .insert(instanceData);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Nova instância criada com sucesso.",
        });
      }

      // 🔧 CONFIGURAR WEBHOOK PARA A NOVA INSTÂNCIA
      try {
        const evolutionApi = createEvolutionApiService({
          apiUrl: modalFormData.apiUrl,
          apiKey: modalFormData.apiKey,
          instanceName: modalFormData.instanceName,
          globalMode: modalFormData.globalMode,
          webhookUrl: '',
          events: []
        });

        const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver`;
        const events = [
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE', 
          'MESSAGES_DELETE',
          'CONNECTION_UPDATE',
          'QRCODE_UPDATED'
        ];

        await evolutionApi.setWebhook(webhookUrl, events);
        console.log('✅ Webhook configurado para nova instância!');
      } catch (webhookError) {
        console.error('⚠️ Erro ao configurar webhook para nova instância:', webhookError);
      }

      // Limpar formulário e fechar modal
      setModalFormData({
        instanceName: '',
        apiUrl: 'https://evolution.codegrana.com.br',
        apiKey: '',
        globalMode: true,
        isPrimary: false
      });
      setEditingInstance(null);
      setIsModalOpen(false);
      
      // Recarregar página
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a instância.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (instance: WhatsAppInstance) => {
    setEditingInstance(instance);
    setModalFormData({
      instanceName: instance.evolution_instance_name,
      apiUrl: instance.api_url,
      apiKey: instance.api_key,
      globalMode: instance.global_mode,
      isPrimary: instance.is_primary
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (instanceId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta instância?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('id', instanceId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Instância excluída com sucesso.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir instância:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a instância.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (instanceId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ is_primary: true })
        .eq('id', instanceId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Instância definida como principal.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao definir instância principal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível definir como principal.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testInstanceConnection = async (instance: WhatsAppInstance) => {
    setLoading(true);
    try {
      const response = await fetch(`${instance.api_url}/instance/connectionState/${instance.evolution_instance_name}`, {
        method: 'GET',
        headers: { 
          'apikey': instance.api_key,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Atualizar status no banco
        await supabase
          .from('settings')
          .update({ 
            instance_status: 'connected',
            last_connection: new Date().toISOString()
          })
          .eq('id', instance.id);

        toast({
          title: "Conexão bem-sucedida!",
          description: `Status: ${data.instance?.state || 'Conectado'}`,
        });
        
        window.location.reload();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      
      // Atualizar status como desconectado
      await supabase
        .from('settings')
        .update({ instance_status: 'disconnected' })
        .eq('id', instance.id);
        
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar à Evolution API.",
        variant: "destructive"
      });
      
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><Wifi className="h-3 w-3 mr-1" />Conectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800"><Settings className="h-3 w-3 mr-1" />Conectando</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800"><WifiOff className="h-3 w-3 mr-1" />Desconectado</Badge>;
    }
  };

  // Filtrar instâncias não principais
  const secondaryInstances = allInstances.filter(instance => !instance.is_primary);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Configuração Principal do WhatsApp
          </CardTitle>
          <CardDescription>
            Configure sua instância principal da Evolution API para WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evolutionApiUrl">URL da Evolution API</Label>
                <Input
                  id="evolutionApiUrl"
                  value={formData.evolutionApiUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, evolutionApiUrl: e.target.value }))}
                  placeholder="https://sua-evolution-api.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="evolutionApiKey">Chave da API</Label>
                <Input
                  id="evolutionApiKey"
                  type="password"
                  value={formData.evolutionApiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, evolutionApiKey: e.target.value }))}
                  placeholder="Sua chave de API"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  value={formData.instanceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, instanceName: e.target.value }))}
                  placeholder="Nome da sua instância"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="globalMode"
                  checked={formData.globalMode}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, globalMode: checked }))}
                />
                <Label htmlFor="globalMode">Modo Global</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={testConnection}
                disabled={loading || !formData.evolutionApiUrl || !formData.evolutionApiKey || !formData.instanceName}
              >
                {loading ? 'Testando...' : 'Testar Conexão'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Seção de Múltiplas Instâncias */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Instâncias Adicionais
              </CardTitle>
              <CardDescription>
                Gerencie múltiplas instâncias do WhatsApp para diferentes números
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                setEditingInstance(null);
                setModalFormData({
                  instanceName: '',
                  apiUrl: 'https://evolution.codegrana.com.br',
                  apiKey: '',
                  globalMode: true,
                  isPrimary: false
                });
                setIsModalOpen(true);
              }}
              className="bg-pharmacy-accent hover:bg-pharmacy-accent/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Instância
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Lista de Instâncias Secundárias */}
          <div className="space-y-4">
            {secondaryInstances.map((instance) => (
              <Card key={instance.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-pharmacy-text1">{instance.evolution_instance_name}</h4>
                        {getStatusBadge(instance.instance_status)}
                      </div>
                      <p className="text-sm text-pharmacy-text2">{instance.api_url}</p>
                      {instance.last_connection && (
                        <p className="text-xs text-pharmacy-text2 mt-1">
                          Última conexão: {new Date(instance.last_connection).toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-pharmacy-text2">
                        Modo Global: {instance.global_mode ? 'Ativado' : 'Desativado'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testInstanceConnection(instance)}
                        disabled={loading}
                      >
                        <Wifi className="h-4 w-4 mr-1" />
                        Testar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(instance.id)}
                        disabled={loading}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Definir Principal
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(instance)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(instance.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {secondaryInstances.length === 0 && (
              <div className="text-center py-8 text-pharmacy-text2">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma instância adicional configurada</p>
                <p className="text-sm mt-1">Clique em "Nova Instância" para adicionar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
          <CardDescription>
            Informações sobre o status da conexão com WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Status da Conexão</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                {primaryInstance?.instance_status === 'connected' ? 'Conectado' : 'Pronto para configurar'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Webhook</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Configuração via N8N
              </span>
            </div>
            
            {primaryInstance?.last_connection && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Última Conexão</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                  {new Date(primaryInstance.last_connection).toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Total de Instâncias</span>
              <span className="text-xs px-2 py-1 bg-pharmacy-accent text-white rounded">
                {allInstances.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nova/Editar Instância */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingInstance ? 'Editar Instância' : 'Nova Instância do WhatsApp'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modalInstanceName">Nome da Instância</Label>
              <Input
                id="modalInstanceName"
                value={modalFormData.instanceName}
                onChange={(e) => setModalFormData(prev => ({ ...prev, instanceName: e.target.value }))}
                placeholder="Ex: farmacia-central"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modalApiUrl">URL da Evolution API</Label>
              <Input
                id="modalApiUrl"
                value={modalFormData.apiUrl}
                onChange={(e) => setModalFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                placeholder="https://sua-evolution-api.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modalApiKey">Chave da API</Label>
              <Input
                id="modalApiKey"
                type="password"
                value={modalFormData.apiKey}
                onChange={(e) => setModalFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Sua chave de API"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="modalGlobalMode"
                checked={modalFormData.globalMode}
                onCheckedChange={(checked) => setModalFormData(prev => ({ ...prev, globalMode: checked }))}
              />
              <Label htmlFor="modalGlobalMode">Modo Global</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="modalIsPrimary"
                checked={modalFormData.isPrimary}
                onCheckedChange={(checked) => setModalFormData(prev => ({ ...prev, isPrimary: checked }))}
              />
              <Label htmlFor="modalIsPrimary">Definir como instância principal</Label>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : editingInstance ? 'Atualizar' : 'Criar Instância'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppTab;
