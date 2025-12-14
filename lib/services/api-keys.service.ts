import { supabase } from '@/lib/db/supabase';
import { EncryptionService } from './encryption.service';

export type AIProvider = 'gemini' | 'deepseek' | 'anthropic';

export interface ApiKey {
    id: string;
    provider: AIProvider;
    encrypted_key: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export class ApiKeysService {
    /**
     * Save or update an API key for the current user
     */
    static async saveApiKey(userId: string, provider: AIProvider, apiKey: string): Promise<{ error: Error | null }> {
        try {
            const encryptedKey = await EncryptionService.encrypt(apiKey);

            const { error } = await supabase
                .from('user_api_keys')
                .upsert({
                    user_id: userId,
                    provider,
                    encrypted_key: encryptedKey,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,provider'
                });

            return { error };
        } catch (err) {
            console.error('Error saving API key:', err);
            return { error: err as Error };
        }
    }

    /**
     * Get a decrypted API key for a specific provider
     */
    static async getApiKey(userId: string, provider: AIProvider): Promise<{ data: string | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('user_api_keys')
                .select('encrypted_key')
                .eq('user_id', userId)
                .eq('provider', provider)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return { data: null, error };
            }

            const decryptedKey = await EncryptionService.decrypt(data.encrypted_key);
            return { data: decryptedKey, error: null };
        } catch (err) {
            console.error('Error getting API key:', err);
            return { data: null, error: err as Error };
        }
    }

    /**
     * List all API keys for a user (without decrypting them)
     */
    static async listUserKeys(userId: string): Promise<{ data: ApiKey[] | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('user_api_keys')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            return { data, error };
        } catch (err) {
            console.error('Error listing API keys:', err);
            return { data: null, error: err as Error };
        }
    }

    /**
     * Delete an API key
     */
    static async deleteApiKey(userId: string, provider: AIProvider): Promise<{ error: Error | null }> {
        try {
            const { error } = await supabase
                .from('user_api_keys')
                .delete()
                .eq('user_id', userId)
                .eq('provider', provider);

            return { error };
        } catch (err) {
            console.error('Error deleting API key:', err);
            return { error: err as Error };
        }
    }

    /**
     * Test if an API key works by making a simple API call
     */
    static async testApiKey(provider: AIProvider, apiKey: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Simple validation: just check if the key format looks correct
            if (!apiKey || apiKey.length < 10) {
                return { success: false, error: 'Clé API invalide' };
            }

            // TODO: Make actual API calls to test the keys
            // For now, just validate the format
            switch (provider) {
                case 'gemini':
                    if (!apiKey.startsWith('AIza')) {
                        return { success: false, error: 'Format de clé Gemini invalide' };
                    }
                    break;
                case 'deepseek':
                    if (!apiKey.startsWith('sk-')) {
                        return { success: false, error: 'Format de clé DeepSeek invalide' };
                    }
                    break;
                case 'anthropic':
                    if (!apiKey.startsWith('sk-ant-')) {
                        return { success: false, error: 'Format de clé Anthropic invalide' };
                    }
                    break;
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    }
}
