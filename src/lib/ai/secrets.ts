/**
 * Xinteck Pattern: Secret Management
 * Encrypted secrets stored in DB, decoupled from .env files.
 * Super Admin can rotate keys via UI without redeployment.
 */

import { decrypt, encrypt } from "@/lib/encryption"
import { prisma } from "@/lib/prisma"

/**
 * Get a decrypted secret by key name.
 * INTERNAL use only — never expose to client.
 */
export async function INTERNAL_getSecret(key: string): Promise<string | null> {
    try {
        const config = await prisma.secretConfig.findUnique({ where: { key } })
        if (config) {
            return decrypt(config.value)
        }

        // Fallback to process.env for local development
        if (process.env[key]) {
            return process.env[key] as string
        }

        return null
    } catch (error) {
        console.error(`Failed to decrypt secret "${key}":`, error)
        // Fallback on error too
        if (process.env[key]) {
            return process.env[key] as string
        }
        return null
    }
}

/**
 * Set (encrypt and store) a secret by key name.
 * Uses AES-256-GCM via the existing encryption module.
 */
export async function setSecret(key: string, plainValue: string): Promise<boolean> {
    try {
        const encryptedValue = encrypt(plainValue)
        await prisma.secretConfig.upsert({
            where: { key },
            update: { value: encryptedValue },
            create: { key, value: encryptedValue },
        })
        return true
    } catch (error) {
        console.error(`Failed to set secret "${key}":`, error)
        return false
    }
}

/**
 * Check if a secret exists (without decrypting).
 */
export async function hasSecret(key: string): Promise<boolean> {
    const config = await prisma.secretConfig.findUnique({
        where: { key },
        select: { id: true },
    })
    return !!config
}
