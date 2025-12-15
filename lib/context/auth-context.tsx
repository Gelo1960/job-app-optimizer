'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/db/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('❌ Erreur récupération session:', error);
                setSession(null);
                setUser(null);
            } else {
                console.log('📱 Session initiale:', session ? 'Connecté' : 'Non connecté');
                setSession(session);
                setUser(session?.user ?? null);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Changement d\'état auth:', event, session ? 'Session active' : 'Pas de session');

            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Gérer les événements spécifiques
            if (event === 'SIGNED_OUT') {
                // Nettoyer l'état local si nécessaire
                router.push('/login');
            } else if (event === 'SIGNED_IN') {
                router.push('/dashboard');
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('✅ Token rafraîchi avec succès');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        return { error };
    };

    const signIn = async (email: string, password: string) => {
        const supabase = createClient();
        console.log('🔐 Tentative de connexion pour:', email);

        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        console.log('🔐 Résultat connexion:', {
            error: error?.message,
            session: data.session ? 'Session créée' : 'Pas de session'
        });

        // Gérer les erreurs spécifiques
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                return {
                    error: new Error('Email ou mot de passe incorrect') as AuthError
                };
            } else if (error.message.includes('Email not confirmed')) {
                return {
                    error: new Error('Veuillez confirmer votre email avant de vous connecter') as AuthError
                };
            }
        }

        return { error };
    };

    const signInWithOAuth = async (provider: 'google' | 'github') => {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error };
    };

    const signOut = async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
