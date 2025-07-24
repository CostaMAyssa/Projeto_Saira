import { useState, useEffect } from 'react';
import { createEvolutionApiService } from '@/services/evolutionApi';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/contexts/SupabaseContext';

interface UseProfilePictureProps {
  contactNumber: string;
  enabled?: boolean;
}

interface ProfilePictureState {
  url: string | null;
  loading: boolean;
  error: string | null;
}

export const useProfilePicture = ({ contactNumber, enabled = true }: UseProfilePictureProps) => {
  const [state, setState] = useState<ProfilePictureState>({
    url: null,
    loading: false,
    error: null,
  });
  const { user } = useSupabase();

  const fetchProfilePicture = async () => {
    if (!contactNumber || !enabled || !user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Buscar configurações do usuário para pegar a instância Evolution
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('evolution_instance_name, evolution_api_url, evolution_api_key')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError || !settings) {
        throw new Error('Configurações da Evolution API não encontradas');
      }

      // 2. Criar instância do serviço Evolution API
      const evolutionService = createEvolutionApiService({
        apiUrl: settings.evolution_api_url,
        apiKey: settings.evolution_api_key,
        instanceName: settings.evolution_instance_name,
      });

      // 3. Buscar foto de perfil
      const response = await evolutionService.fetchProfilePicture(contactNumber);

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.error || 'Erro ao buscar foto de perfil' 
        }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        url: response.profilePictureUrl || null 
      }));

    } catch (error) {
      console.error('Erro ao buscar foto de perfil:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }));
    }
  };

  useEffect(() => {
    fetchProfilePicture();
  }, [contactNumber, enabled, user]);

  return {
    ...state,
    refetch: fetchProfilePicture,
  };
};