import { createClient } from './server';
import type { User } from '@supabase/supabase-js';

/**
 * Obtient un client Supabase authentifié pour les Server Actions et Route Handlers
 * Utilise @supabase/ssr pour une gestion correcte des cookies SSR
 */
export async function getAuthenticatedClient() {
  return await createClient();
}

/**
 * Obtient l'utilisateur actuellement authentifié
 * @throws Error si l'utilisateur n'est pas authentifié
 */
export async function getAuthenticatedUser(): Promise<User> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Not authenticated');
  }

  return user;
}

/**
 * Vérifie si l'utilisateur est authentifié (sans lever d'exception)
 * @returns User ou null
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return user;
}
