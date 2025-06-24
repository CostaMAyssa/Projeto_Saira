import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/contexts/SupabaseContext';

const WhatsAppTab = () => {
  const { toast } = useToast();
  const { user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    evolutionApiUrl: 'https://evoapi.insignemarketing.com.br', // URL atualizada conforme docker-compose
    evolutionApiKey: '33cf7bf9876391ff485115742bdb149a', // API Key atualizada conforme docker-compose
    instanceName: '',
    globalMode: true // Padrão para modo global conforme configuração
  });

  // Carregar configurações existentes DO USUÁRIO LOGADO
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        // Buscar a configuração específica deste usuário
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setFormData({
            evolutionApiUrl: data.evolution_api_url || '',
            evolutionApiKey: data.evolution_api_key || '',
            instanceName: data.evolution_instance_name || '',
            globalMode: data.global_mode || false
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações salvas.",
          variant: "destructive"
        });
      }
    };

    fetchSettings();
  }, [toast, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // Dados a serem salvos
      const settingsData = {
        user_id: user.id, // Chave para o upsert
        evolution_api_url: formData.evolutionApiUrl,
        evolution_api_key: formData.evolutionApiKey,
        evolution_instance_name: formData.instanceName,
        global_mode: formData.globalMode,
        // O campo 'updated_at' é gerenciado automaticamente pelo trigger do banco
      };

      // Usar upsert para simplificar e garantir a operação correta
      const { error } = await supabase
        .from('settings')
        .upsert(settingsData, {
          onConflict: 'user_id',
        });
      
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações do WhatsApp salvas com sucesso.",
        variant: "default"
      });
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
        toast({
          title: "Conexão bem-sucedida!",
          description: `Status: ${data.instance?.state || 'Conectado'}`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar à Evolution API. Verifique as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Configurações do WhatsApp
          </CardTitle>
          <CardDescription>
            Configure a integração com a Evolution API para WhatsApp
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
                {loading ? 'Verificando...' : 'Pronto para configurar'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Webhook</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Configuração via N8N
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppTab;
