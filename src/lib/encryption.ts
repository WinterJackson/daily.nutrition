import crypto from 'crypto';

// Algorithm: AES-256-GCM (Authenticated Encryption)
// This is currently considered a very secure standard.
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64; // Length of salt
const TAG_LENGTH = 16; // GCM tag length

// Get key from env or throw error
function getMasterKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        // In development we can fallback, but in production this should crash
        if (process.env.NODE_ENV === 'development') {
            console.warn("⚠️  WARNING: Using insecure default encryption key. Set ENCRYPTION_KEY in .env to secure your data.");
            return 'dev-insecure-master-key-change-me-in-prod-12345';
        }
        throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    return key;
}

/**
 * Xinteck Pattern: Optimized Key Derivation
 * Supports direct 64-character hex keys (32 bytes) for zero-overhead symmetric encryption,
 * gracefully falling back to scryptSync for variable-length semantic keys.
 */
function getKey(): Buffer {
    const masterKey = getMasterKey()

    // If it's exactly 64 characters and pure hex, it's a pre-generated 256-bit key
    if (masterKey.length === 64 && /^[0-9a-fA-F]+$/.test(masterKey)) {
        return Buffer.from(masterKey, 'hex')
    }

    // Fallback: use scrypt to securely derive a 32-byte key from any string length
    return crypto.scryptSync(masterKey, 'salt', 32)
}

/**
 * Encrypts a text string using AES-256-GCM
 * Returns a colon-separated string: iv:tag:encrypted_content
 */
export function encrypt(text: string): string {
    const key = getKey();

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a colon-separated string (iv:tag:encrypted_content)
 */
export function decrypt(text: string): string {
    const key = getKey();

    const parts = text.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted string format');
    }

    const [ivHex, tagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
