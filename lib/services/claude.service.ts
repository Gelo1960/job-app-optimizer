import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Service pour interagir avec l'API Claude
 */
export class ClaudeService {
  /**
   * Envoie un prompt à Claude et retourne la réponse
   */
  static async sendPrompt(
    prompt: string,
    systemPrompt?: string,
    model: string = 'claude-sonnet-4-20250514'
  ): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const firstBlock = response.content[0];
      if (firstBlock.type === 'text') {
        return firstBlock.text;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  /**
   * Envoie une conversation multi-tours à Claude
   */
  static async sendConversation(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    model: string = 'claude-sonnet-4-20250514'
  ): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const firstBlock = response.content[0];
      if (firstBlock.type === 'text') {
        return firstBlock.text;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }

  /**
   * Parse une réponse JSON de Claude (avec gestion d'erreurs)
   */
  static parseJSON<T>(response: string): T {
    try {
      // Claude peut retourner du markdown avec ```json
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;

      return JSON.parse(jsonString.trim());
    } catch (error) {
      console.error('Error parsing JSON from Claude:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse JSON response from Claude');
    }
  }

  /**
   * Helper: Envoie un prompt et parse la réponse JSON
   */
  static async sendPromptJSON<T>(
    prompt: string,
    systemPrompt?: string,
    model?: string
  ): Promise<T> {
    const response = await this.sendPrompt(prompt, systemPrompt, model);
    return this.parseJSON<T>(response);
  }
}
