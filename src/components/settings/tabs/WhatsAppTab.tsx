import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const WhatsAppTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    evolutionApiUrl: 'https://evoapi.insignemarketing.com.br', // URL atualizada conforme docker-compose
    evolutionApiKey: '33cf7bf9876391ff485115742bdb149a', // API Key atualizada conforme docker-compose
    instanceName: '',
    globalMode: true // Padrão para modo global conforme configuração
  });

  // Carregar configurações existentes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Buscar a primeira configuração existente ou criar uma nova
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
          setFormData({
            evolutionApiUrl: data.api_url || 'https://evoapi.insignemarketing.com.br',
            evolutionApiKey: data.api_key || '33cf7bf9876391ff485115742bdb149a',
            instanceName: data.instance_name || '',
            globalMode: data.global_mode !== undefined ? data.global_mode : true
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
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const settingsData = {
        api_url: formData.evolutionApiUrl,
        api_key: formData.evolutionApiKey,
        instance_name: formData.instanceName,
        global_mode: formData.globalMode,
        updated_at: new Date().toISOString()
      };

      let result;
      if (settingsId) {
        // Atualizar configuração existente
        result = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', settingsId);
      } else {
        // Criar nova configuração (UUID será gerado automaticamente)
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
        description: "Configurações do WhatsApp atualizadas com sucesso.",
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

  return (
    <Card className="bg-white border border-pharmacy-border1 shadow-sm">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl text-pharmacy-text1">Configurações do WhatsApp</CardTitle>
        <CardDescription className="text-sm text-pharmacy-text2">
          Configure sua integração com a Evolution API para WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="evolutionApiUrl" className="text-pharmacy-text1">
                URL da Evolution API
              </Label>
              <Input
                id="evolutionApiUrl"
                type="url"
                placeholder="https://sua-evolution-api.com"
                value={formData.evolutionApiUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, evolutionApiUrl: e.target.value }))}
                className="bg-pharmacy-light2 border-gray-300"
              />
              <p className="text-xs text-pharmacy-text2">
                URL base da sua Evolution API (atual: https://evoapi.insignemarketing.com.br)
              </p>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="evolutionApiKey" className="text-pharmacy-text1">
                Chave da API
              </Label>
              <Input
                id="evolutionApiKey"
                type="password"
                placeholder="Sua chave da Evolution API"
                value={formData.evolutionApiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, evolutionApiKey: e.target.value }))}
                className="bg-pharmacy-light2 border-gray-300"
              />
              <p className="text-xs text-pharmacy-text2">
                Chave de autenticação da Evolution API (AUTHENTICATION_API_KEY)
              </p>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="instanceName" className="text-pharmacy-text1">
                Nome da Instância
              </Label>
              <Input
                id="instanceName"
                type="text"
                placeholder="Nome da sua instância do WhatsApp"
                value={formData.instanceName}
                onChange={(e) => setFormData(prev => ({ ...prev, instanceName: e.target.value }))}
                className="bg-pharmacy-light2 border-gray-300"
                disabled={formData.globalMode}
              />
              <p className="text-xs text-pharmacy-text2">
                {formData.globalMode 
                  ? 'No modo global, não é necessário especificar instância' 
                  : 'Nome da instância específica para usar no modo tradicional'
                }
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="globalMode"
                checked={formData.globalMode}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, globalMode: checked }))}
              />
              <Label htmlFor="globalMode" className="text-pharmacy-text1">
                Modo Global (Recomendado)
              </Label>
            </div>
            <p className="text-xs text-pharmacy-text2">
              No modo global (WEBSOCKET_GLOBAL_EVENTS=true), você receberá eventos de todas as instâncias. 
              Este modo precisa ser habilitado no servidor Evolution API.
            </p>

            {/* Informações de configuração atual */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                ⚠️ Configuração Atual do Servidor Evolution API:
              </h4>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• ❌ WebSocket está DESABILITADO (WEBSOCKET_ENABLED=false)</li>
                <li>• ❌ Eventos globais DESABILITADOS (WEBSOCKET_GLOBAL_EVENTS=false)</li>
                <li>• ✅ URL: https://evoapi.insignemarketing.com.br</li>
                <li>• ✅ API Key: 33cf7bf9876391ff485115742bdb149a</li>
              </ul>
              <div className="mt-2 p-2 bg-red-100 rounded">
                <p className="text-xs text-red-800 font-medium">
                  🔧 Para o chat funcionar, você precisa habilitar no docker-compose:
                </p>
                <code className="text-xs block mt-1">
                  WEBSOCKET_ENABLED=true<br/>
                  WEBSOCKET_GLOBAL_EVENTS=true
                </code>
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTab;
