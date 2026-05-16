
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl && 
                    supabaseAnonKey && 
                    supabaseUrl.startsWith('http') &&
                    !supabaseUrl.includes('your-supabase-url');

if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errString = typeof args[0] === 'string' ? args[0] : (args[0]?.message || '');
    if (errString.includes('Refresh token is not valid')) {
      localStorage.removeItem('sb-lgtmmvztmelrmlzjppzx-auth-token');
      return;
    }
    originalConsoleError(...args);
  };
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.name === 'AuthApiError' && event.reason?.message?.includes('Refresh token is not valid')) {
      event.preventDefault();
      localStorage.removeItem('sb-lgtmmvztmelrmlzjppzx-auth-token');
    }
  });
}

const realSupabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          ... (typeof window !== 'undefined' && 
               localStorage.getItem('sb-lgtmmvztmelrmlzjppzx-auth-token')?.includes('fallback-token')
            ? { Authorization: `Bearer ${supabaseAnonKey}` }
            : {})
        }
      }
    })
  : null;
export const mockSupabase = {
  auth: {
    signInWithPassword: async () => {
      return { data: { user: { id: 'mock-user', email: 'mock@example.com' } }, error: null };
    },
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: { user: { id: 'mock-user' } } }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null }) }),
      order: () => ({ data: [], error: null }),
      match: () => ({ data: [], error: null }),
    }),
    insert: (data: any) => ({ data: null, error: null }),
    update: (data: any) => ({ 
      eq: (col: string, val: any) => ({ error: null }) 
    }),
    delete: () => ({ 
      eq: (col: string, val: any) => ({ error: null }) 
    }),
  }),
};


export const supabase = (realSupabase || mockSupabase) as unknown as ReturnType<typeof createClient>;
