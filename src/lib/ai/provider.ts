/**
 * AI Provider — OpenRouter Integration (Hardened)
 * 
 * Uses OpenRouter's Chat Completions API to access free, high-quality models
 * with no geographic restrictions (Gemini's free tier is geo-blocked in Kenya).
 * 
 * Strategy:
 * 1. Try the primary model with retry + exponential backoff
 * 2. If it fails, cascade through a ranked list of free fallback models
 * 3. Last resort: use the openrouter/auto router (auto-selects any available free model)
 */

import { INTERNAL_getSecret } from "./secrets"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

/**
 * Ranked list of free models to try, in order of content quality.
 * These are confirmed available on OpenRouter as of April 2026.
 * OpenRouter rotates free models — if one is retired, we cascade to the next.
 */
const FREE_MODELS = [
    "qwen/qwen3.6-plus:free",                     // Excellent for long-form content
    "stepfun/step-3.5-flash:free",                 // Fast, high quality
    "nvidia/nemotron-3-super:free",                // 262K context, great for articles
    "meta-llama/llama-3.3-70b-instruct:free",      // GPT-4 class, if available
    "deepseek/deepseek-r1:free",                   // Strong reasoning
    "arcee-ai/trinity-large-preview:free",         // Good generalist
    "openrouter/auto",                              // Last resort: auto-route to any free model
]

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
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Call OpenRouter's Chat Completions API for a single model.
 * Returns the raw text response or throws with diagnostic info.
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
            throw new Error("FATAL_AUTH: Invalid OpenRouter API key. Please update it in Admin → Settings → Integrations.")
        }
        if (response.status === 402) {
            throw new Error("FATAL_CREDITS: OpenRouter credits exhausted. Try again tomorrow or add credits at openrouter.ai.")
        }
        // 429 = rate limited (retryable by switching models)
        if (response.status === 429) {
            throw new Error(`RATE_LIMITED: Model ${model} is rate-limited. ${errorBody.slice(0, 150)}`)
        }
        // 503 = model temporarily unavailable
        if (response.status === 503) {
            throw new Error(`UNAVAILABLE: Model ${model} is temporarily unavailable.`)
        }

        throw new Error(`API_ERROR_${response.status}: ${errorBody.slice(0, 200)}`)
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content

    if (!text || text.trim().length === 0) {
        throw new Error(`EMPTY_RESPONSE: Model ${model} returned an empty response.`)
    }

    return text.trim()
}

/**
 * Try a single model with up to 2 retries using exponential backoff.
 * Only retries on 429 (rate limit). All other errors propagate immediately.
 */
async function tryModelWithRetry(prompt: string, model: string, apiKey: string): Promise<string> {
    const MAX_RETRIES = 2
    const BASE_DELAY_MS = 2000 // 2 seconds

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await callOpenRouter(prompt, model, apiKey)
        } catch (error: any) {
            const msg = error.message || ""

            // Fatal errors — never retry
            if (msg.startsWith("FATAL_")) {
                throw new Error(msg.replace(/^FATAL_\w+:\s*/, ""))
            }

            // Rate limited — retry with backoff (only on first model)
            if (msg.startsWith("RATE_LIMITED") && attempt < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt)
                console.warn(`[AI] ${model} rate-limited, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
                await sleep(delay)
                continue
            }

            // All other errors (unavailable, API errors, empty responses) — propagate
            throw error
        }
    }

    throw new Error(`RATE_LIMITED: Model ${model} still rate-limited after ${MAX_RETRIES} retries.`)
}

/**
 * Generate text using OpenRouter with cascading model fallback.
 * 
 * Strategy:
 * 1. Try each model in the FREE_MODELS list in order
 * 2. Each model gets up to 2 retries with exponential backoff for 429 errors
 * 3. Fatal errors (auth, credits) stop immediately
 * 4. Non-fatal errors (rate limit, unavailable) cascade to the next model
 */
export async function generateWithAI(prompt: string): Promise<string> {
    const apiKey = await getApiKey()
    const errors: string[] = []

    for (const model of FREE_MODELS) {
        try {
            const result = await tryModelWithRetry(prompt, model, apiKey)
            return result
        } catch (error: any) {
            const msg = error.message || ""

            // Fatal errors stop the entire cascade
            if (msg.includes("Invalid OpenRouter API key") || msg.includes("credits exhausted")) {
                throw error
            }

            // Log and try next model
            console.warn(`[AI] Model ${model} failed: ${msg}`)
            errors.push(`${model}: ${msg}`)
        }
    }

    // All models failed
    throw new Error(
        `All AI models are currently unavailable. This is a temporary issue with OpenRouter's free tier. ` +
        `Please try again in a few minutes. Details: ${errors.join(" | ")}`
    )
}

/**
 * @deprecated Use generateWithAI instead. Kept for backward compatibility.
 */
export const generateWithGemini = generateWithAI
