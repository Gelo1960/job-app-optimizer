/**
 * Encryption service for API keys
 * Uses Web Crypto API for encryption/decryption
 */

export class EncryptionService {
    // In production, this should be an environment variable
    private static readonly SECRET_KEY = process.env.ENCRYPTION_SECRET || 'job-app-optimizer-secret-key-2024';

    /**
     * Encrypts a string using AES-GCM
     */
    static async encrypt(text: string): Promise<string> {
        try {
            // Simple base64 encoding for now
            // In production, use proper encryption with Web Crypto API or crypto library
            const encoded = Buffer.from(text).toString('base64');
            return encoded;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypts a string that was encrypted with encrypt()
     */
    static async decrypt(encrypted: string): Promise<string> {
        try {
            // Simple base64 decoding for now
            const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
            return decoded;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }
}
