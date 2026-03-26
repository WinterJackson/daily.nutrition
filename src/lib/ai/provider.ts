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
        tools: [{ googleSearchRetrieval: {} }]
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
        if (error.message?.includes("API key")) {
            throw new Error("Invalid Gemini API key. Please update it in Admin → Blog → AI → Config.")
        }
        if (error.message?.includes("quota")) {
            throw new Error("Gemini API quota exceeded. Please try again later or check your billing.")
        }
        throw error
    }
}
