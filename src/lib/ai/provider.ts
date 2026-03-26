/**
 * Xinteck Pattern: AI Provider
 * Runtime-decrypted Gemini API key initialization.
 */

import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai"
import { INTERNAL_getSecret } from "./secrets"

let cachedModel: GenerativeModel | null = null
let cachedKeyHash: string | null = null

/**
 * Get a configured Gemini model instance.
 * Uses runtime-decrypted API key from SecretConfig.
 */
export async function getGeminiModel(): Promise<GenerativeModel> {
    const apiKey = await INTERNAL_getSecret("GEMINI_API_KEY")
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured. Go to Admin → Blog → AI → Config to set it.")
    }

    // Cache model if key hasn't changed
    const keyHash = apiKey.slice(-8)
    if (cachedModel && cachedKeyHash === keyHash) {
        return cachedModel
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    cachedModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    })
    cachedKeyHash = keyHash
    return cachedModel
}

/**
 * Generate text with Gemini, with error handling and cleanup.
 */
export async function generateWithGemini(prompt: string): Promise<string> {
    const model = await getGeminiModel()

    try {
        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        if (!text || text.trim().length === 0) {
            throw new Error("Gemini returned an empty response")
        }

        return text.trim()
    } catch (error: any) {
        const msg = error.message || ""
        if (msg.includes("API key")) {
            throw new Error("Invalid Gemini API key. Please update it in Admin → Blog → AI.")
        }
        if (msg.includes("User location is not supported") || msg.includes("location is not supported")) {
            throw new Error("Google blocked this request: The completely free AI tier is not natively supported in your geographical region (Kenya) without verification. Please add a billing card to your Google Cloud project to immediately bypass this Geo-block.")
        }
        if (msg.includes("quota") || msg.includes("429") || msg.includes("limit: 0")) {
            throw new Error("Google AI Quota strictly set to 0. This region requires you to attach a billing card to your Google Cloud API account to unlock the 15 RPM free tier limits.")
        }
        if (msg.includes("404") || msg.includes("not found")) {
            throw new Error("The requested Gemini model is forcefully hidden by Google for your API Key's region setup. Please ensure billing is enabled on Google Cloud to unlock the models.")
        }
        throw error
    }
}
