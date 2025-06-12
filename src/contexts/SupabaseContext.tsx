import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js';
import { supabase, verifySupabaseConnection } from '../lib/supabase';

interface UserMetadata {
  name?: string;
  role?: string;
  status?: string;
  [key: string]: string | undefined;
}

interface SupabaseContextType {
  supabase: typeof supabase; // Add this line (typeof supabase from the import)
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOffline: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, userData?: UserMetadata) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  forceConnectionCheck: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  
  // Refs para controle de estado
  const connectionCheckRef = useRef<Promise<boolean> | null>(null);
  const lastConnectionCheckRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Verificar a conexão com o Supabase com throttling
  const checkConnection = async (force = false) => {
    if (!mountedRef.current) return false;
    
    const now = Date.now();
    const timeSinceLastCheck = now - lastConnectionCheckRef.current;
    
    // Se já há uma verificação em andamento, aguardar o resultado
    if (connectionCheckRef.current && !force) {
      return await connectionCheckRef.current;
    }
    
    // Throttling: só verificar se passou mais de 30 segundos da última verificação
    if (timeSinceLastCheck < 30000 && !force) {
      return !isOffline; // Retornar estado atual se verificação recente
    }

    try {
      console.log("Verificando conexão com o Supabase...");
      lastConnectionCheckRef.current = now;
      
      const connectionPromise = verifySupabaseConnection();
      connectionCheckRef.current = connectionPromise;
      
      const isConnected = await connectionPromise;
      
      if (mountedRef.current) {
        setIsOffline(!isConnected);
        console.log("Status de conexão com Supabase:", isConnected ? "Conectado" : "Desconectado");
      }
      
      return isConnected;
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      if (mountedRef.current) {
        setIsOffline(true);
      }
      return false;
    } finally {
      connectionCheckRef.current = null;
    }
  };

  // Função pública para forçar verificação de conexão
  const forceConnectionCheck = async () => {
    console.log("Forçando verificação de conexão...");
    await checkConnection(true);
  };

  useEffect(() => {
    mountedRef.current = true;
    
    const handleOnlineStatusChange = () => {
      const isOnline = window.navigator.onLine;
      if (isOnline) {
        // Se voltar a ficar online, verificar se o Supabase está acessível
        checkConnection(true);
      } else {
        setIsOffline(true);
      }
    };

    // Verificar status inicial apenas uma vez
    checkConnection(true);

    // Adicionar listeners para eventos de online/offline
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  useEffect(() => {
    // Configurar o listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        console.log("Evento de autenticação:", event, session ? "Com sessão" : "Sem sessão");
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Verificar sessão atual ao carregar
    const checkSession = async () => {
      if (!mountedRef.current) return;
      
      try {
        const { data } = await supabase.auth.getSession();
        if (mountedRef.current) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Cleanup do listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Verificar conexão antes de tentar autenticação
    const isConnected = await checkConnection(true);
    
    // Se estiver offline, simular login bem-sucedido com dados mockados
    if (!isConnected) {
      console.log("Modo offline: Simulando login com sucesso");
      
      // Criar uma resposta simulada
      const mockUser: User = {
        id: "offline-user-id",
        app_metadata: {},
        user_metadata: { 
          name: email.split('@')[0], 
          role: "admin", 
          status: "ativo" 
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const mockResponse: AuthResponse = {
        data: {
          user: mockUser,
          session: null
        },
        error: null
      };
      
      // Definir usuário no estado
      setUser(mockUser);
      
      return mockResponse;
    }
    
    // Caso contrário, tentar autenticação normal
    try {
      console.log("Tentando autenticação com o Supabase...");
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      
      // Se houver erro de conexão, ativar modo offline
      setIsOffline(true);
      
      // Retornar erro para ser tratado no componente
      return {
        data: { 
          user: null, 
          session: null 
        },
        error: {
          message: "Falha na conexão com o servidor",
          status: 0
        } as AuthError
      };
    }
  };

  const signUp = async (email: string, password: string, userData?: UserMetadata) => {
    console.log("Contexto: Iniciando processo de registro...");
    console.log("Dados de registro:", { email, hasPassword: !!password, userData });
    
    // Verificar conexão antes de tentar registro
    const isConnected = await checkConnection(true);
    
    // Se estiver offline, simular registro bem-sucedido
    if (!isConnected) {
      console.log("Modo offline: Simulando registro com sucesso");
      
      // Criar uma resposta simulada
      const mockUser: User = {
        id: "offline-user-id",
        app_metadata: {},
        user_metadata: { 
          name: userData?.name || email.split('@')[0], 
          role: userData?.role || "agent", 
          status: userData?.status || "ativo"
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const mockResponse: AuthResponse = {
        data: {
          user: mockUser,
          session: null
        },
        error: null
      };
      
      // Definir usuário no estado
      setUser(mockUser);
      
      return mockResponse;
    }
    
    // Caso contrário, tentar registro normal
    try {
      console.log("Tentando registro com o Supabase...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });
      
      if (error) {
        console.error("Erro no registro:", error);
        throw error;
      }
      
      console.log("Registro realizado com sucesso:", data);
      return { data, error };
    } catch (error) {
      console.error("Erro ao registrar:", error);
      
      // Retornar erro
      return {
        data: { 
          user: null, 
          session: null 
        },
        error: error as AuthError
      };
    }
  };

  const signOut = async () => {
    // Se estiver no modo offline, apenas limpar o estado localmente
    if (isOffline) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
    
    return supabase.auth.signOut();
  };

  const value = {
    supabase, // Add this line (the imported supabase client instance)
    user,
    session,
    loading,
    isOffline,
    signIn,
    signUp,
    signOut,
    forceConnectionCheck
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}; 