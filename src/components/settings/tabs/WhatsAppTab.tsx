import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { EvolutionApiService } from '@/services/evolutionApi';

interface SettingsData {
  id: string;
  api_url: string;
  api_key: string;
  instance_name: string;
  global_mode: boolean;
}

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
          const settings = data as SettingsData;
          setSettingsId(settings.id);
          setFormData({
            evolutionApiUrl: settings.api_url || 'https://evoapi.insignemarketing.com.br',
            evolutionApiKey: settings.api_key || '33cf7bf9876391ff485115742bdb149a',
            instanceName: settings.instance_name || '',
            globalMode: settings.global_mode !== undefined ? settings.global_mode : true
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const dataToSave = {
        api_url: formData.evolutionApiUrl,
        api_key: formData.evolutionApiKey,
        instance_name: formData.instanceName,
        global_mode: formData.globalMode,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (settingsId) {
        result = await supabase
          .from('settings')
          .update(dataToSave)
          .eq('id', settingsId);
      } else {
        result = await supabase
          .from('settings')
          .insert([{ ...dataToSave, created_at: new Date().toISOString() }]);
      }

      if (result.error) {
        throw result.error;
      }

      // 🔧 CORREÇÃO: Configurar webhook automático após salvar
      try {
        console.log('🔧 Configurando webhook automático...');
        
        const webhookUrl = `${window.location.origin}/api/evolution`;
        const evolutionApi = new EvolutionApiService({
          apiUrl: formData.evolutionApiUrl,
          apiKey: formData.evolutionApiKey,
          instanceName: formData.instanceName,
          globalMode: formData.globalMode
        });

        // Configurar webhook para receber eventos (modo global não precisa verificar instância)
        const events = [
          'QRCODE_UPDATED',
          'MESSAGES_UPSERT', 
          'MESSAGES_UPDATE',
          'MESSAGES_DELETE',
          'CONNECTION_UPDATE',
          'CONTACTS_UPSERT',
          'CHATS_UPSERT'
        ];

        await evolutionApi.setWebhook(webhookUrl, events);
        console.log('✅ Webhook configurado:', webhookUrl);

        toast({
          title: "Configurações salvas com sucesso!",
          description: "WebSocket e webhook configurados automaticamente",
        });
      } catch (webhookError) {
        console.error('❌ Erro ao configurar webhook:', webhookError);
        toast({
          title: "Configurações salvas",
          description: "Webhook não pôde ser configurado automaticamente. Configure manualmente se necessário.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
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
        <form className="space-y-4">
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
                No modo global, não é necessário especificar instância
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
              No modo global (WEBSOCKET_GLOBAL_EVENTS=true), você receberá eventos de todas as instâncias. Este modo precisa ser habilitado no servidor Evolution API.
            </p>
          </div>

          {/* Informações de configuração atual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              🔧 Correções Implementadas para Mensagens em Tempo Real:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• ✅ Webhook automático configurado como fallback</li>
              <li>• ✅ Reconexão infinita do WebSocket implementada</li>
              <li>• ✅ Endpoint `/api/evolution` criado para receber eventos</li>
              <li>• ✅ Factory singleton para evitar múltiplas conexões</li>
              <li>• ⚠️ Para tempo real completo, habilite no servidor:</li>
              <li className="ml-4">WEBSOCKET_ENABLED=true ✅ (já habilitado)</li>
              <li className="ml-4">WEBSOCKET_GLOBAL_EVENTS=true ✅ (já habilitado)</li>
              <li>• 🔧 Configure WEBHOOK_GLOBAL_URL no seu docker-compose</li>
            </ul>
          </div>

          <Button 
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-pharmacy-primary hover:bg-pharmacy-primary/90 text-white"
          >
            {loading ? (
              <>
                <MessageSquare className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTab;
