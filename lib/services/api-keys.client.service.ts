import { createClient } from '@/lib/db/client';
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

/**
 * Client-side API Keys Service
 * For use in Client Components (browser)
 */
export class ApiKeysClientService {
    /**
     * Save or update an API key for the current user
     */
    static async saveApiKey(userId: string, provider: AIProvider, apiKey: string): Promise<{ error: Error | null }> {
        try {
            const supabase = createClient();
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
            const supabase = createClient();
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
            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_api_keys')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                return { data: null, error };
            }

            return { data: data as ApiKey[], error: null };
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
            const supabase = createClient();
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
     * Test if an API key is valid for a given provider
     */
    static async testApiKey(provider: AIProvider, apiKey: string): Promise<{ success: boolean; error: string | null }> {
        // This method doesn't use Supabase, just makes an API call to test the key
        try {
            switch (provider) {
                case 'anthropic':
                    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01',
                        },
                        body: JSON.stringify({
                            model: 'claude-3-haiku-20240307',
                            max_tokens: 10,
                            messages: [{ role: 'user', content: 'test' }],
                        }),
                    });

                    return { success: anthropicResponse.ok, error: null };

                case 'gemini':
                    const geminiResponse = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: 'test' }] }],
                            }),
                        }
                    );

                    return { success: geminiResponse.ok, error: null };

                case 'deepseek':
                    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: 'deepseek-chat',
                            messages: [{ role: 'user', content: 'test' }],
                            max_tokens: 10,
                        }),
                    });

                    return { success: deepseekResponse.ok, error: null };

                default:
                    return { success: false, error: 'Unknown provider' };
            }
        } catch (err) {
            console.error('Error testing API key:', err);
            return { success: false, error: (err as Error).message };
        }
    }
}
