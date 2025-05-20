import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
// Idealmente, estas credenciais deveriam estar em variáveis de ambiente
// Para desenvolvimento local, criar um arquivo .env com:
// VITE_SUPABASE_URL=https://[projeto-id].supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Configurações para o Supabase
const supabaseUrl = 'https://xnzuamyrbgdxtodiqmzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.ek3IR6aUgUyvile2qJGvt3KcAwrtoX12MXOS5NUaA_c';

// Opções adicionais para depuração
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: true, // Habilitar logs de depuração
  }
};

// Verificar se estamos online
const isOnline = window.navigator.onLine;
console.log("Status de conexão:", isOnline ? "Online" : "Offline");

// Inicializa o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Função para verificar se o Supabase está acessível
export const verifySupabaseConnection = async () => {
  try {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tempo limite excedido')), 5000);
    });
    
    const connectionTest = supabase.from('health_check').select('*').limit(1);
    await Promise.race([connectionTest, timeout]);
    return true;
  } catch (error) {
    console.warn("Erro ao conectar ao Supabase:", error);
    return false;
  }
}; 