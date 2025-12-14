/**
 * Unified AI Service supporting multiple LLM providers
 * Automatically detects and uses available API keys
 */

import { ApiKeysService, AIProvider } from './api-keys.service';

interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AIResponse {
    text: string;
    provider: 'gemini' | 'deepseek' | 'anthropic';
}

interface ProviderKeys {
    gemini?: string;
    deepseek?: string;
    anthropic?: string;
}

export class AIService {
    /**
     * Get available API keys, prioritizing user keys over environment variables
     */
    private static async getAvailableKeys(userId?: string): Promise<ProviderKeys> {
        const keys: ProviderKeys = {};

        // Try to get user's stored keys first
        if (userId) {
            const providers: AIProvider[] = ['gemini', 'deepseek', 'anthropic'];

            for (const provider of providers) {
                const { data } = await ApiKeysService.getApiKey(userId, provider);
                if (data) {
                    keys[provider] = data;
                }
            }
        }

        // Fallback to environment variables
        if (!keys.gemini && process.env.GEMINI_API_KEY) {
            keys.gemini = process.env.GEMINI_API_KEY;
        }
        if (!keys.deepseek && process.env.DEEPSEEK_API_KEY) {
            keys.deepseek = process.env.DEEPSEEK_API_KEY;
        }
        if (!keys.anthropic && process.env.ANTHROPIC_API_KEY) {
            keys.anthropic = process.env.ANTHROPIC_API_KEY;
        }

        return keys;
    }

    private static getAvailableProvider(keys: ProviderKeys): 'gemini' | 'deepseek' | 'anthropic' | null {
        if (keys.gemini) return 'gemini';
        if (keys.deepseek) return 'deepseek';
        if (keys.anthropic) return 'anthropic';
        return null;
    }

    /**
     * Send a prompt and get a text response
     * @param userId - Optional user ID to use user's stored API keys
     */
    static async sendPrompt(
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number; userId?: string }
    ): Promise<AIResponse> {
        const keys = await this.getAvailableKeys(options?.userId);
        const provider = this.getAvailableProvider(keys);

        if (!provider) {
            throw new Error('Aucune clé API configurée. Veuillez ajouter vos clés dans les Paramètres.');
        }

        switch (provider) {
            case 'gemini':
                return await this.callGemini(keys.gemini!, prompt, systemPrompt, options);
            case 'deepseek':
                return await this.callDeepSeek(keys.deepseek!, prompt, systemPrompt, options);
            case 'anthropic':
                return await this.callAnthropic(keys.anthropic!, prompt, systemPrompt, options);
        }
    }

    /**
     * Send a prompt and parse JSON response
     */
    static async sendPromptJSON<T>(
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number; userId?: string }
    ): Promise<T> {
        const response = await this.sendPrompt(prompt, systemPrompt, options);
        return this.parseJSON<T>(response.text);
    }

    // ========================================================================
    // GEMINI IMPLEMENTATION
    // ========================================================================
    private static async callGemini(
        apiKey: string,
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<AIResponse> {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemPrompt,
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: options?.temperature ?? 0.7,
                maxOutputTokens: options?.maxTokens ?? 4096,
            },
        });

        return {
            text: result.response.text(),
            provider: 'gemini',
        };
    }

    // ========================================================================
    // DEEPSEEK IMPLEMENTATION (OpenAI-compatible)
    // ========================================================================
    private static async callDeepSeek(
        apiKey: string,
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<AIResponse> {
        const messages: any[] = [];

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 4096,
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            text: data.choices[0].message.content,
            provider: 'deepseek',
        };
    }

    // ========================================================================
    // ANTHROPIC IMPLEMENTATION
    // ========================================================================
    private static async callAnthropic(
        apiKey: string,
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<AIResponse> {
        const Anthropic = await import('@anthropic-ai/sdk');
        const anthropic = new Anthropic.default({
            apiKey,
        });

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: options?.maxTokens ?? 4096,
            temperature: options?.temperature ?? 0.7,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
        });

        const firstBlock = response.content[0];
        if (firstBlock.type === 'text') {
            return {
                text: firstBlock.text,
                provider: 'anthropic',
            };
        }

        throw new Error('Unexpected response format from Anthropic');
    }

    // ========================================================================
    // UTILITIES
    // ========================================================================
    private static parseJSON<T>(response: string): T {
        try {
            // Handle markdown code blocks
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : response;
            return JSON.parse(jsonString.trim());
        } catch (error) {
            console.error('Error parsing JSON from AI:', error);
            console.error('Raw response:', response);
            throw new Error('Failed to parse JSON response from AI');
        }
    }
}
