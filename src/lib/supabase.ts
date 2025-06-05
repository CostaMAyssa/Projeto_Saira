import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
// JWT para autenticação
const JWT_SECRET = '38fbeb0da9691dd519a94bc6d344bb0405d6a77a';

// Configurações para o Supabase
const supabaseUrl = 'https://supapainel.insignemarketing.com.br';

// Chaves de acesso
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.ek3IR6aUgUyvile2qJGvt3KcAwrtoX12MXOS5NUaA_c';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.fT85MMmzeF1BtM3K8NDQm8aYQOVhSDfmjoVuXK_PgIc';

console.log("Configurando clientes Supabase:", {
  url: supabaseUrl,
  serviceKeyStart: serviceKey.substring(0, 20) + "...",
  anonKeyStart: anonKey.substring(0, 20) + "..."
});

// Opções para cliente de autenticação - FORÇAR CACHE REFRESH
const authOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: false,
    storageKey: 'sb-auth-token',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x',
      'Cache-Control': 'no-cache', // Forçar sem cache
      'Pragma': 'no-cache',
    },
  },
  db: {
    schema: 'public',
  },
};

// Opções para cliente administrativo
const adminOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x-admin',
      'Cache-Control': 'no-cache', // Forçar sem cache
      'Pragma': 'no-cache',
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

// Cliente principal para autenticação de usuários
export const supabase = createClient(supabaseUrl, anonKey, authOptions);

// Cliente administrativo para operações que requerem privilégios elevados
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, adminOptions);

console.log("Clientes Supabase inicializados:", {
  auth: !!supabase,
  admin: !!supabaseAdmin
});

// Suprimir logs de erro específicos do Realtime
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('realtime') || 
       message.includes('insig') || 
       message.includes('409'))) {
    // Suprimir erros do Realtime que não afetam a funcionalidade principal
    return;
  }
  originalConsoleError.apply(console, args);
};

// Função para forçar refresh do schema cache
export const forceSchemaRefresh = async () => {
  try {
    console.log("🔄 Forçando refresh do schema cache...");
    // Fazer uma query simples para forçar refresh do cache
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    console.log("✅ Schema refresh concluído");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro no schema refresh:", error);
    return { success: false, error };
  }
};

// Função para verificar se o Supabase está acessível
export const verifySupabaseConnection = async () => {
  try {
    const timeout = new Promise<{data: null, error: Error}>((_, reject) => {
      setTimeout(() => reject(new Error('Tempo limite excedido')), 10000);
    });
    
    console.log("Tentando conexão com:", supabaseUrl);
    
    try {
      console.log("Verificando autenticação...");
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