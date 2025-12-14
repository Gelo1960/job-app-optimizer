/**
 * Unified AI Service supporting multiple LLM providers
 * Automatically detects and uses available API keys
 */

interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AIResponse {
    text: string;
    provider: 'gemini' | 'deepseek' | 'anthropic';
}

export class AIService {
    private static getAvailableProvider(): 'gemini' | 'deepseek' | 'anthropic' | null {
        if (process.env.GEMINI_API_KEY) return 'gemini';
        if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
        if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
        return null;
    }

    /**
     * Send a prompt and get a text response
     */
    static async sendPrompt(
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<AIResponse> {
        const provider = this.getAvailableProvider();

        if (!provider) {
            throw new Error('No AI API key configured. Please add GEMINI_API_KEY, DEEPSEEK_API_KEY, or ANTHROPIC_API_KEY to .env.local');
        }

        switch (provider) {
            case 'gemini':
                return await this.callGemini(prompt, systemPrompt, options);
            case 'deepseek':
                return await this.callDeepSeek(prompt, systemPrompt, options);
            case 'anthropic':
                return await this.callAnthropic(prompt, systemPrompt, options);
        }
    }

    /**
     * Send a prompt and parse JSON response
     */
    static async sendPromptJSON<T>(
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<T> {
        const response = await this.sendPrompt(prompt, systemPrompt, options);
        return this.parseJSON<T>(response.text);
    }

    // ========================================================================
    // GEMINI IMPLEMENTATION
    // ========================================================================
    private static async callGemini(
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<AIResponse> {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
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
        prompt: string,
        systemPrompt?: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<AIResponse> {
        const Anthropic = await import('@anthropic-ai/sdk');
        const anthropic = new Anthropic.default({
            apiKey: process.env.ANTHROPIC_API_KEY!,
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
