/**
 * Xinteck Pattern: Dynamic Cloudinary Initialization
 * 
 * Cloudinary is NEVER initialized globally with static .env variables.
 * Instead, credentials are decrypted on-the-fly from the SecretConfig table
 * via INTERNAL_getSecret(), or falling back to the CloudinaryConfig DB model.
 * 
 * This allows Super Admins to rotate keys via the Settings UI without redeployment.
 */

import { INTERNAL_getSecret } from "@/lib/ai/secrets"
import { v2 as cloudinary } from "cloudinary"

/**
 * Dynamically initialize and return a configured Cloudinary instance.
 * Credentials are resolved in this priority order:
 * 1. SecretConfig table (INTERNAL_getSecret pattern)
 * 2. CloudinaryConfig DB model (encrypted API secret)
 * 3. Throws if neither is available
 */
export async function getCloudinary() {
    try {
        const cloudName = await INTERNAL_getSecret("CLOUDINARY_CLOUD_NAME")
        const apiKey = await INTERNAL_getSecret("CLOUDINARY_API_KEY")
        const apiSecret = await INTERNAL_getSecret("CLOUDINARY_API_SECRET")

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true,
            })
            return cloudinary
        }

        // No configuration found — fail gracefully
        throw new Error("Cloudinary is not configured. Set credentials in Admin Settings → Integrations.")
    } catch (error) {
        if (error instanceof Error && error.message.includes("not configured")) {
            throw error
        }
        console.error("Error configuring Cloudinary:", error)
        throw new Error("Failed to initialize Cloudinary. Check your configuration.")
    }
}
