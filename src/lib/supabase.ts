import { createClient } from '@supabase/supabase-js';

// 🔧 NOVA CONFIGURAÇÃO - SUPABASE SaaS
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://svkgfvfhmngcvfsjpero.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2dmdmZobW5nY3Zmc2pwZXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTcxNDAsImV4cCI6MjA2NjQzMzE0MH0.sX6QdL0qJkCEfolVuNHuiPD9dZHAujfQXOhZENAEAfc';

// ⚠️ REMOVIDO: Configurações da instância local antiga
// const JWT_SECRET = '38fbeb0da9691dd519a94bc6d344bb0405d6a77a'; 
// const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Chave antiga removida

// 🚀 Cliente Supabase principal
export const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 📊 Status da configuração
export const supabaseConfig = {
  status: "✅ Conectado ao Supabase SaaS",
  url: supabaseUrl,
  project: "svkgfvfhmngcvfsjpero",
  environment: import.meta.env.NODE_ENV || 'development',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? "✅ Configurada via .env" : "⚠️ Usando fallback hardcoded",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Configurada via .env" : "⚠️ Usando fallback hardcoded",
};

// 🔍 Debug: Log da configuração (apenas em desenvolvimento)
if (import.meta.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Config:', supabaseConfig);
}

// 🧪 Função para testar conexão
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testando conexão com Supabase...');
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Conexão Supabase funcionando!');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Erro crítico na conexão:', err);
    return { success: false, error: 'Erro crítico na conexão' };
  }
};

// 🧪 Função para testar tabelas específicas
export const testTables = async () => {
  const tables = ['clients', 'products', 'forms', 'campaigns'];
  const results = {};
  
  console.log('🧪 Testando tabelas...');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.error(`❌ Erro na tabela ${table}:`, error);
        results[table] = { success: false, error: error.message };
      } else {
        console.log(`✅ Tabela ${table} OK`);
        results[table] = { success: true, count: data?.length || 0 };
      }
    } catch (err) {
      console.error(`❌ Erro crítico na tabela ${table}:`, err);
      results[table] = { success: false, error: 'Erro crítico' };
    }
  }
  
  return results;
};

// 🌐 Expor funções no window para debug (apenas em desenvolvimento)
if (import.meta.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection;
  window.testTables = testTables;
  window.supabaseConfig = supabaseConfig;
  window.supabase = supabase;
}

// Verificar se estamos online
const isOnline = window.navigator.onLine;
console.log("Status de conexão:", isOnline ? "Online" : "Offline");
console.log("Inicializando Supabase com URL:", supabaseUrl);

// Exportar clientes singleton
export const supabaseAdmin = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

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