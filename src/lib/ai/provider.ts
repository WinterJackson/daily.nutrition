/**
 * AI Provider — OpenRouter Integration
 * 
 * Uses OpenRouter's Chat Completions API to access free, high-quality models
 * with no geographic restrictions (Gemini's free tier is geo-blocked in Kenya).
 * 
 * Default model: meta-llama/llama-3.3-70b-instruct:free (GPT-4 class quality, 131K context)
 * Fallback model: deepseek/deepseek-r1:free (strong reasoning, 164K context)
 */

import { INTERNAL_getSecret } from "./secrets"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const PRIMARY_MODEL = "meta-llama/llama-3.3-70b-instruct:free"
const FALLBACK_MODEL = "deepseek/deepseek-r1:free"

/**
 * Get the OpenRouter API key from encrypted SecretConfig or env fallback.
 */
async function getApiKey(): Promise<string> {
    const apiKey = await INTERNAL_getSecret("OPENROUTER_API_KEY")
    if (!apiKey) {
        throw new Error(
            "OpenRouter API Key not configured. Go to Admin → Settings → Integrations to set it up. " +
            "Get your free key at openrouter.ai/keys — no credit card required."
        )
    }
    return apiKey
}

/**
 * Call OpenRouter's Chat Completions API with automatic model fallback.
 * Returns the raw text response from the AI model.
 */
async function callOpenRouter(prompt: string, model: string, apiKey: string): Promise<string> {
    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://edwaknutrition.co.ke",
            "X-Title": "Edwak Nutrition AI Hub",
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: "system",
                    content: "You are a senior clinical nutritionist and content strategist for Edwak Nutrition, a premier nutrition consultancy in Nairobi, Kenya. You specialize in evidence-based nutrition content targeting the East African market. Always use Kenyan food examples, local health statistics, and metric units. Never mention AI tools, ChatGPT, or language models."
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 4096,
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text().catch(() => "")

        if (response.status === 401) {
            throw new Error("Invalid OpenRouter API key. Please update it in Admin → Settings → Integrations.")
        }
        if (response.status === 429) {
            throw new Error("AI rate limit reached. Free tier allows 20 requests/minute and 50/day. Please wait a moment and try again.")
        }
        if (response.status === 402) {
            throw new Error("OpenRouter credits exhausted. The free tier has a daily limit. Try again tomorrow or add credits at openrouter.ai.")
        }

        throw new Error(`OpenRouter API error (${response.status}): ${errorBody.slice(0, 200)}`)
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content

    if (!text || text.trim().length === 0) {
        throw new Error("AI returned an empty response. Please try again.")
    }

    return text.trim()
}

/**
 * Generate text using OpenRouter with automatic fallback.
 * Primary: Llama 3.3 70B (GPT-4 class, excellent for content)
 * Fallback: DeepSeek R1 (strong reasoning, good for structured outputs)
 */
export async function generateWithAI(prompt: string): Promise<string> {
    const apiKey = await getApiKey()

    try {
        return await callOpenRouter(prompt, PRIMARY_MODEL, apiKey)
    } catch (primaryError: any) {
        // If primary model fails (not auth/rate issues), try fallback
        const msg = primaryError.message || ""
        if (msg.includes("API key") || msg.includes("rate limit") || msg.includes("credits")) {
            throw primaryError // Don't retry on auth/rate issues
        }

        console.warn(`Primary model (${PRIMARY_MODEL}) failed, trying fallback (${FALLBACK_MODEL}):`, msg)
        try {
            return await callOpenRouter(prompt, FALLBACK_MODEL, apiKey)
        } catch (fallbackError: any) {
            throw new Error(`AI generation failed on both models. Primary: ${msg}. Fallback: ${fallbackError.message}`)
        }
    }
}

/**
 * @deprecated Use generateWithAI instead. Kept for backward compatibility.
 */
export const generateWithGemini = generateWithAI
