import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
// JWT para autenticação
const JWT_SECRET = '38fbeb0da9691dd519a94bc6d344bb0405d6a77a';

// Configurações para o Supabase
const supabaseUrl = 'https://supapainel.insignemarketing.com.br';

// Chaves de acesso
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.ek3IR6aUgUyvile2qJGvt3KcAwrtoX12MXOS5NUaA_c';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.fT85MMmzeF1BtM3K8NDQm8aYQOVhSDfmjoVuXK_PgIc';

console.log("Usando URLs e credenciais:", {
  url: supabaseUrl,
  serviceKeyStart: serviceKey.substring(0, 20) + "...",
  anonKeyStart: anonKey.substring(0, 20) + "...",
  jwtSecret: JWT_SECRET.substring(0, 5) + "..."
});

// Opções adicionais para depuração e configuração
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: true,
    storageKey: 'sb-auth-token',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x',
    },
  },
  db: {
    schema: 'public',
  },
};

// Verificar se estamos online
const isOnline = window.navigator.onLine;
console.log("Status de conexão:", isOnline ? "Online" : "Offline");
console.log("Inicializando Supabase com URL:", supabaseUrl);

// Inicializa o cliente Supabase com a chave de serviço para permissões completas
export const supabase = createClient(supabaseUrl, serviceKey, supabaseOptions);

// Log para depuração
console.log("Cliente Supabase inicializado:", !!supabase);

// Função para verificar se o Supabase está acessível
export const verifySupabaseConnection = async () => {
  try {
    const timeout = new Promise<{data: null, error: Error}>((_, reject) => {
      setTimeout(() => reject(new Error('Tempo limite excedido')), 10000);
    });
    
    console.log("Tentando conexão com:", supabaseUrl);
    
    try {
      console.log("Verificando autenticação...");
      // Usar um método de autenticação que não requer rede
      const { data, error } = await Promise.race([
        supabase.auth.getSession(),
        timeout
      ]);
      
      if (error) {
        console.warn("Erro na verificação de sessão:", error);
        return false;
      }
      
      console.log("Sessão verificada com sucesso:", data ? "Com dados" : "Sem dados");
      return true;
    } catch (authError) {
      console.error("Erro na autenticação:", authError);
      return false;
    }
  } catch (error) {
    console.warn("Erro ao conectar ao Supabase:", error);
    return false;
  }
};