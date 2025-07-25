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

// Função para formatar número de telefone
const formatPhoneNumber = (number: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = number.replace(/\D/g, '');
  
  // Se já tem código do país (55), mantém
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return cleaned;
  }
  
  // Se não tem código do país, adiciona 55
  if (cleaned.length >= 10) {
    return `55${cleaned}`;
  }
  
  return cleaned;
};

// Função para log detalhado
const logProfilePictureAttempt = (step: string, data: any) => {
  console.log(`[ProfilePicture] ${step}:`, data);
};

export const useProfilePicture = ({ contactNumber, enabled = true }: UseProfilePictureProps) => {
  const [state, setState] = useState<ProfilePictureState>({
    url: null,
    loading: false,
    error: null,
  });
  const { user } = useSupabase();

  const fetchProfilePicture = async () => {
    if (!contactNumber || !enabled || !user) {
      logProfilePictureAttempt('Skipped', { 
        contactNumber, 
        enabled, 
        hasUser: !!user,
        reason: 'Missing required parameters'
      });
      return;
    }

    logProfilePictureAttempt('Starting', { 
      contactNumber, 
      userId: user.id,
      enabled 
    });

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 1. Buscar configurações do usuário (usando nomes corretos das colunas)
      logProfilePictureAttempt('Fetching settings', { userId: user.id });
      
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('evolution_instance_name, api_url, api_key')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) {
        logProfilePictureAttempt('Settings error', settingsError);
        throw new Error(`Erro ao buscar configurações: ${settingsError.message}`);
      }

      if (!settings) {
        logProfilePictureAttempt('No settings found', { userId: user.id });
        throw new Error('Configurações da Evolution API não encontradas');
      }

      logProfilePictureAttempt('Settings found', {
        instanceName: settings.evolution_instance_name,
        apiUrl: settings.api_url,
        hasApiKey: !!settings.api_key
      });

      // Validar configurações
      if (!settings.api_url || !settings.api_key || !settings.evolution_instance_name) {
        logProfilePictureAttempt('Invalid settings', settings);
        throw new Error('Configurações da Evolution API incompletas');
      }

      // 2. Formatar número de telefone
      const formattedNumber = formatPhoneNumber(contactNumber);
      logProfilePictureAttempt('Number formatting', {
        original: contactNumber,
        formatted: formattedNumber
      });

      // 3. Criar instância do serviço Evolution API
      const evolutionService = createEvolutionApiService({
        apiUrl: settings.api_url,
        apiKey: settings.api_key,
        instanceName: settings.evolution_instance_name,
      });

      // 4. Testar diferentes formatos de número
      const numberFormats = [
        formattedNumber,
        contactNumber,
        `${formattedNumber}@c.us`,
        `${contactNumber}@c.us`
      ];

      let profileResponse = null;
      let successFormat = null;

      for (const format of numberFormats) {
        try {
          logProfilePictureAttempt('Trying format', { format });
          
          const response = await evolutionService.fetchProfilePicture(format);
          
          logProfilePictureAttempt('API Response', {
            format,
            response,
            hasUrl: !!(response.profilePictureUrl || response.url),
            hasError: !!response.error
          });

          // Verificar se a resposta tem uma URL válida
          if (response.profilePictureUrl || response.url) {
            profileResponse = response;
            successFormat = format;
            break;
          }

          // Se não tem URL mas também não tem erro, continua tentando
          if (!response.error) {
            logProfilePictureAttempt('No URL in response', { format, response });
          }

        } catch (formatError) {
          logProfilePictureAttempt('Format error', { format, error: formatError });
          // Continua tentando outros formatos
        }
      }

      if (!profileResponse) {
        logProfilePictureAttempt('All formats failed', { numberFormats });
        throw new Error('Não foi possível buscar foto de perfil com nenhum formato de número');
      }

      if (profileResponse.error) {
        logProfilePictureAttempt('Profile response error', profileResponse.error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: profileResponse.error || 'Erro ao buscar foto de perfil' 
        }));
        return;
      }

      // Verificar diferentes campos possíveis na resposta
      const possibleUrlFields = ['profilePictureUrl', 'url', 'picture', 'avatar'];
      let finalUrl = null;

      for (const field of possibleUrlFields) {
        if (profileResponse[field]) {
          finalUrl = profileResponse[field];
          logProfilePictureAttempt('URL found', { 
            field, 
            url: finalUrl,
            successFormat 
          });
          break;
        }
      }

      if (!finalUrl) {
        logProfilePictureAttempt('No URL found in response', {
          response: profileResponse,
          availableFields: Object.keys(profileResponse)
        });
      }

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        url: finalUrl 
      }));

      logProfilePictureAttempt('Success', { 
        finalUrl, 
        successFormat,
        contactNumber 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      logProfilePictureAttempt('Final error', {
        error: errorMessage,
        contactNumber,
        stack: error instanceof Error ? error.stack : undefined
      });

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
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