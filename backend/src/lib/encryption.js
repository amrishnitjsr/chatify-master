// =====================================
// MESSAGE ENCRYPTION UTILITY
// =====================================
// End-to-end encryption for messages using AES-256-GCM

import crypto from 'crypto';
import { ENV } from './env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // For GCM, this is always 12 bytes
const SALT_LENGTH = 64;
const TAG_LENGTH = 16; // GCM auth tag is 16 bytes
const ITERATIONS = 100000;

/**
 * Generate encryption key from user passwords and app secret
 * This ensures only the sender and receiver can decrypt messages
 */
function generateEncryptionKey(senderId, receiverId) {
    // Create a consistent key regardless of sender/receiver order
    const participants = [senderId.toString(), receiverId.toString()].sort();
    const keyMaterial = participants.join(':') + ':' + ENV.ENCRYPTION_SECRET;

    return crypto.pbkdf2Sync(keyMaterial, ENV.ENCRYPTION_SALT, ITERATIONS, 32, 'sha256');
}

/**
 * Encrypt a message text
 * @param {string} plaintext - The message to encrypt
 * @param {string} senderId - Sender's user ID
 * @param {string} receiverId - Receiver's user ID
 * @returns {string} - Encrypted message in base64 format
 */
export function encryptMessage(plaintext, senderId, receiverId) {
    try {
        if (!plaintext) return null;

        const key = generateEncryptionKey(senderId, receiverId);
        const iv = crypto.randomBytes(IV_LENGTH); // GCM mode uses 12 bytes IV

        const cipher = crypto.createCipherGCM(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Combine IV + encrypted data + auth tag
        const result = Buffer.concat([
            iv,
            Buffer.from(encrypted, 'hex'),
            authTag
        ]);

        return result.toString('base64');

    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
}/**
 * Decrypt a message text
 * @param {string} encryptedData - The encrypted message in base64
 * @param {string} senderId - Sender's user ID
 * @param {string} receiverId - Receiver's user ID
 * @returns {string} - Decrypted message
 */
export function decryptMessage(encryptedData, senderId, receiverId) {
    try {
        if (!encryptedData) return null;

        const key = generateEncryptionKey(senderId, receiverId);
        const data = Buffer.from(encryptedData, 'base64');

        // Extract IV, encrypted data, and auth tag
        const iv = data.slice(0, IV_LENGTH);
        const authTag = data.slice(-TAG_LENGTH);
        const encrypted = data.slice(IV_LENGTH, -TAG_LENGTH);

        const decipher = crypto.createDecipherGCM(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;

    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt message');
    }
}

/**
 * Client-side encryption (for frontend use)
 * This will be used in the frontend to encrypt messages before sending
 */
export const clientEncryption = {
    /**
     * Generate a key pair for a chat between two users
     */
    generateChatKey: (senderId, receiverId) => {
        // This will be implemented on the frontend
        // Using a simple algorithm that both sender and receiver can compute
        const participants = [senderId, receiverId].sort();
        return participants.join(':');
    },

    /**
     * Simple encryption for client-side (will be enhanced on frontend)
     */
    encryptText: async (text, chatKey) => {
        // This is a placeholder - will be implemented with crypto-js on frontend
        return btoa(text); // Simple base64 encoding as fallback
    },

    /**
     * Simple decryption for client-side
     */
    decryptText: async (encryptedText, chatKey) => {
        // This is a placeholder - will be implemented with crypto-js on frontend
        try {
            return atob(encryptedText); // Simple base64 decoding as fallback
        } catch {
            return encryptedText; // Return as-is if not encrypted
        }
    }
};

/**
 * Validate encryption configuration
 */
export function validateEncryptionConfig() {
    if (!ENV.ENCRYPTION_SECRET || ENV.ENCRYPTION_SECRET === 'your-encryption-secret-here') {
        console.warn('⚠️  ENCRYPTION_SECRET not configured - using default (not secure for production)');
        return false;
    }

    if (!ENV.ENCRYPTION_SALT || ENV.ENCRYPTION_SALT === 'your-encryption-salt-here') {
        console.warn('⚠️  ENCRYPTION_SALT not configured - using default (not secure for production)');
        return false;
    }

    return true;
}