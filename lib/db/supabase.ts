import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * @deprecated This client is deprecated for authentication flows.
 * Use lib/db/client.ts for Client Components
 * Use lib/db/server.ts for Server Components and Route Handlers
 * This file is kept for backward compatibility with API routes.
 */

// Types générés depuis Supabase (à regénérer après création du schema)
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/db/database.types.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Support pour les deux noms de variables
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  '';

// Flag pour savoir si Supabase est configuré
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Créer un client mock si les variables ne sont pas configurées
type MockResponse = { data: null; error: null };
type MockBuilder = {
  select: () => MockBuilder;
  insert: () => MockBuilder;
  update: () => MockBuilder;
  delete: () => MockBuilder;
  upsert: () => MockBuilder;
  eq: () => MockBuilder;
  neq: () => MockBuilder;
  gt: () => MockBuilder;
  gte: () => MockBuilder;
  lt: () => MockBuilder;
  lte: () => MockBuilder;
  like: () => MockBuilder;
  ilike: () => MockBuilder;
  is: () => MockBuilder;
  in: () => MockBuilder;
  contains: () => MockBuilder;
  order: () => MockBuilder;
  limit: () => MockBuilder;
  range: () => MockBuilder;
  single: () => Promise<MockResponse>;
  maybeSingle: () => Promise<MockResponse>;
};

const mockResponse: MockResponse = { data: null, error: null };

const createMockBuilder = (): MockBuilder => {
  const mockBuilder: MockBuilder = {
    select: () => mockBuilder,
    insert: () => mockBuilder,
    update: () => mockBuilder,
    delete: () => mockBuilder,
    upsert: () => mockBuilder,
    eq: () => mockBuilder,
    neq: () => mockBuilder,
    gt: () => mockBuilder,
    gte: () => mockBuilder,
    lt: () => mockBuilder,
    lte: () => mockBuilder,
    like: () => mockBuilder,
    ilike: () => mockBuilder,
    is: () => mockBuilder,
    in: () => mockBuilder,
    contains: () => mockBuilder,
    order: () => mockBuilder,
    limit: () => mockBuilder,
    range: () => mockBuilder,
    single: () => Promise.resolve(mockResponse),
    maybeSingle: () => Promise.resolve(mockResponse),
  };
  return mockBuilder;
};

const createMockClient = () => {
  return {
    from: () => createMockBuilder(),
    rpc: () => Promise.resolve(mockResponse),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
};

// Lazy initialization pour éviter les erreurs au build
let _supabase: SupabaseClient | ReturnType<typeof createMockClient> | null = null;
let _supabaseAdmin: SupabaseClient | ReturnType<typeof createMockClient> | null = null;

export const getSupabase = () => {
  if (!_supabase) {
    if (isSupabaseConfigured) {
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
      console.warn('Supabase not configured, using mock client');
      _supabase = createMockClient();
    }
  }
  return _supabase;
};

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (supabaseUrl && serviceRoleKey) {
      _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } else {
      console.warn('Supabase Admin not configured, using mock client');
      _supabaseAdmin = createMockClient();
    }
  }
  return _supabaseAdmin;
};

// Export pour compatibilité avec le code existant
// Utilise un getter pour lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    return (client as Record<string, unknown>)[prop as string];
  }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin();
    return (client as Record<string, unknown>)[prop as string];
  }
});
