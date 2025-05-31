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
  const [formData, setFormData] = useState({
    evolutionApiUrl: '',
    evolutionApiKey: '',
    instanceName: '',
    globalMode: false
  });

  // Carregar configurações existentes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'whatsapp')
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            evolutionApiUrl: data.evolution_api_url || '',
            evolutionApiKey: data.evolution_api_key || '',
            instanceName: data.instance_name || '',
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
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 'whatsapp',
          evolution_api_url: formData.evolutionApiUrl,
          evolution_api_key: formData.evolutionApiKey,
          instance_name: formData.instanceName,
          global_mode: formData.globalMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

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
                Deixe em branco se estiver usando o modo global
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="globalMode"
                checked={formData.globalMode}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, globalMode: checked }))}
              />
              <Label htmlFor="globalMode" className="text-pharmacy-text1">
                Modo Global
              </Label>
            </div>
            <p className="text-xs text-pharmacy-text2">
              No modo global, você receberá eventos de todas as instâncias. 
              Desative para receber eventos apenas da instância especificada.
            </p>
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
