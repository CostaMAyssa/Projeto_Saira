import { SupabaseClient } from '@supabase/supabase-js';

// Declarações globais para debug no desenvolvimento
declare global {
  interface Window {
    testSupabaseConnection?: () => Promise<{ success: boolean; error?: string; data?: unknown }>;
    testTables?: () => Promise<Record<string, { success: boolean; error?: string; count?: number }>>;
    supabaseConfig?: {
      status: string;
      url: string;
      project: string;
      environment: string;
      supabaseUrl: string;
      anonKey: string;
    };
    supabase?: SupabaseClient;
  }
}

export {}; 