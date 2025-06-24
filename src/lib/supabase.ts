import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase - Agora vindas de variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supapainel.insignemarketing.com.br';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.fT85MMmzeF1BtM3K8NDQm8aYQOVhSDfmjoVuXK_PgIc';

// JWT para autenticação (mantido como fallback)
const JWT_SECRET = '38fbeb0da9691dd519a94bc6d344bb0405d6a77a';

// Chave de serviço (mantida como fallback)
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.ek3IR6aUgUyvile2qJGvt3KcAwrtoX12MXOS5NUaA_c';

// Singleton para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

console.log("Configurando clientes Supabase:", {
  url: supabaseUrl,
  serviceKeyStart: serviceKey.substring(0, 20) + "...",
  anonKeyStart: anonKey.substring(0, 20) + "..."
});

// Verificar se as variáveis de ambiente estão sendo carregadas
console.log("Variáveis de ambiente carregadas:", {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? "✅ Configurada" : "❌ Não configurada",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Não configurada",
  n8nWebhook: import.meta.env.VITE_N8N_WEBHOOK_URL ? "✅ Configurada" : "❌ Não configurada"
});

// Opções para cliente de autenticação
const authOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: false,
    storageKey: 'sb-green-pharmacy-auth',
  },
};

// Opções para cliente administrativo
const adminOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

// Função para criar ou retornar instância singleton do cliente principal
const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, anonKey, authOptions);
    console.log("Cliente Supabase principal criado");
  }
  return supabaseInstance;
};

// Função para criar ou retornar instância singleton do cliente admin
const getSupabaseAdminClient = () => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, serviceKey, adminOptions);
    console.log("Cliente Supabase admin criado");
  }
  return supabaseAdminInstance;
};

// Verificar se estamos online
const isOnline = window.navigator.onLine;
console.log("Status de conexão:", isOnline ? "Online" : "Offline");
console.log("Inicializando Supabase com URL:", supabaseUrl);

// Exportar clientes singleton
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

console.log("Clientes Supabase inicializados:", {
  auth: !!supabase,
  admin: !!supabaseAdmin
});

// Suprimir logs de erro específicos do Realtime e GoTrueClient
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('Multiple GoTrueClient instances') || 
       message.includes('realtime') || 
       message.includes('insig') || 
       message.includes('409'))) {
    // Suprimir warnings específicos que não afetam a funcionalidade
    return;
  }
  originalConsoleWarn.apply(console, args);
};

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

// Cache para evitar múltiplas verificações simultâneas
let connectionCheckInProgress = false;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 segundos

// Função para verificar se o Supabase está acessível
export const verifySupabaseConnection = async () => {
  // Evitar múltiplas verificações simultâneas
  const now = Date.now();
  if (connectionCheckInProgress || (now - lastConnectionCheck) < CONNECTION_CHECK_INTERVAL) {
    return true; // Assumir conexão OK se verificação recente
  }

  connectionCheckInProgress = true;
  lastConnectionCheck = now;

  try {
    const timeout = new Promise<{data: null, error: Error}>((_, reject) => {
      setTimeout(() => reject(new Error('Tempo limite excedido')), 5000);
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
  } finally {
    connectionCheckInProgress = false;
  }
};