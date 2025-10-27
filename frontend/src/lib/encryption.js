// =====================================
// FRONTEND MESSAGE ENCRYPTION UTILITY
// =====================================
// Client-side encryption using crypto-js

import CryptoJS from 'crypto-js';
import { config, devUtils } from './config.js';

// Encryption configuration
const ENCRYPTION_CONFIG = {
    algorithm: 'AES',
    mode: CryptoJS.mode.GCM,
    padding: CryptoJS.pad.NoPadding,
    keySize: 256,
    ivSize: 96, // 12 bytes for GCM
    iterations: 100000,
};

/**
 * Generate a consistent encryption key for a chat between two users
 * @param {string} senderId - User ID of sender
 * @param {string} receiverId - User ID of receiver
 * @returns {string} - Encryption key
 */
function generateChatKey(senderId, receiverId) {
    // Create consistent key regardless of sender/receiver order
    const participants = [senderId, receiverId].sort();
    const keyMaterial = participants.join(':') + ':chatify-e2e-2024';

    // Use PBKDF2 for key derivation
    const salt = CryptoJS.enc.Utf8.parse('chatify-salt-for-message-encryption-unique-per-app');
    const key = CryptoJS.PBKDF2(keyMaterial, salt, {
        keySize: ENCRYPTION_CONFIG.keySize / 32,
        iterations: ENCRYPTION_CONFIG.iterations,
        hasher: CryptoJS.algo.SHA256
    });

    return key;
}

/**
 * Encrypt a message text on the client side
 * @param {string} plaintext - Message to encrypt
 * @param {string} senderId - Sender user ID
 * @param {string} receiverId - Receiver user ID
 * @returns {string|null} - Encrypted message in base64 or null if encryption fails
 */
export function encryptMessage(plaintext, senderId, receiverId) {
    try {
        if (!plaintext || typeof plaintext !== 'string') {
            return null;
        }

        devUtils.log('🔐 Encrypting message for:', { senderId, receiverId });

        const key = generateChatKey(senderId, receiverId);
        const iv = CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.ivSize / 8);

        const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
            iv: iv,
            mode: CryptoJS.mode.CTR, // Using CTR mode for better browser compatibility
            padding: CryptoJS.pad.NoPadding
        });

        // Combine IV and encrypted data
        const combined = iv.concat(encrypted.ciphertext);
        const result = CryptoJS.enc.Base64.stringify(combined);

        devUtils.log('✅ Message encrypted successfully');
        return result;

    } catch (error) {
        devUtils.error('❌ Encryption failed:', error);
        return null;
    }
}

/**
 * Decrypt a message text on the client side
 * @param {string} encryptedData - Encrypted message in base64
 * @param {string} senderId - Sender user ID
 * @param {string} receiverId - Receiver user ID
 * @returns {string|null} - Decrypted message or null if decryption fails
 */
export function decryptMessage(encryptedData, senderId, receiverId) {
    try {
        if (!encryptedData || typeof encryptedData !== 'string') {
            return null;
        }

        devUtils.log('🔓 Decrypting message from:', { senderId, receiverId });

        const key = generateChatKey(senderId, receiverId);
        const combined = CryptoJS.enc.Base64.parse(encryptedData);

        // Extract IV and encrypted data
        const ivSize = ENCRYPTION_CONFIG.ivSize / 8;
        const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, ivSize / 4));
        const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(ivSize / 4));

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CTR,
                padding: CryptoJS.pad.NoPadding
            }
        );

        const result = decrypted.toString(CryptoJS.enc.Utf8);

        if (!result) {
            throw new Error('Decryption resulted in empty string');
        }

        devUtils.log('✅ Message decrypted successfully');
        return result;

    } catch (error) {
        devUtils.error('❌ Decryption failed:', error);
        return encryptedData; // Return original if decryption fails
    }
}

/**
 * Simple fallback encryption (for development/testing)
 * @param {string} text - Text to encrypt
 * @returns {string} - Base64 encoded text
 */
export function simpleEncrypt(text) {
    try {
        return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
        devUtils.error('Simple encryption failed:', error);
        return text;
    }
}

/**
 * Simple fallback decryption (for development/testing)
 * @param {string} encodedText - Base64 encoded text
 * @returns {string} - Decoded text
 */
export function simpleDecrypt(encodedText) {
    try {
        return decodeURIComponent(escape(atob(encodedText)));
    } catch (error) {
        devUtils.warn('Simple decryption failed, returning original:', error);
        return encodedText;
    }
}

/**
 * Test encryption/decryption functionality
 * @param {string} senderId - Test sender ID
 * @param {string} receiverId - Test receiver ID
 * @returns {boolean} - True if test passes
 */
export function testEncryption(senderId = 'user1', receiverId = 'user2') {
    const testMessage = 'Hello, this is a test message! 🔐';

    try {
        devUtils.log('🧪 Testing encryption...');

        const encrypted = encryptMessage(testMessage, senderId, receiverId);
        if (!encrypted) {
            throw new Error('Encryption returned null');
        }

        const decrypted = decryptMessage(encrypted, senderId, receiverId);
        if (decrypted !== testMessage) {
            throw new Error(`Decryption mismatch: "${decrypted}" !== "${testMessage}"`);
        }

        devUtils.log('✅ Encryption test passed!');
        return true;

    } catch (error) {
        devUtils.error('❌ Encryption test failed:', error);
        return false;
    }
}

// Auto-test encryption on module load in development
if (config.dev.debugMode) {
    setTimeout(() => {
        testEncryption();
    }, 100);
}

export default {
    encrypt: encryptMessage,
    decrypt: decryptMessage,
    simpleEncrypt,
    simpleDecrypt,
    test: testEncryption,
};