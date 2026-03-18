"use server"

import { buildDraftPrompt, buildExclusionSuggestPrompt, buildScoutPrompt, DEFAULT_AI_CONFIG, type AiConfig } from "@/lib/ai/prompts"
import { generateWithGemini } from "@/lib/ai/provider"
import { calculateScore, type ScoringInput } from "@/lib/ai/scoring"
import { hasSecret, setSecret } from "@/lib/ai/secrets"
import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { revalidatePath } from "next/cache"

// ═══════════════════════════════════════════════════════
// AI Configuration (stored in SiteSettings as JSON)
// ═══════════════════════════════════════════════════════

export async function getAiConfig(): Promise<AiConfig> {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
        })
        if (!settings) return DEFAULT_AI_CONFIG

        // Store ai_config as a custom field — we'll use a separate JSON approach
        const raw = await prisma.secretConfig.findUnique({ where: { key: "ai_config" } })
        if (!raw) return DEFAULT_AI_CONFIG

        return JSON.parse(raw.value) as AiConfig
    } catch {
        return DEFAULT_AI_CONFIG
    }
}

export async function updateAiConfig(config: AiConfig) {
    const session = await verifySession()
    if (!session || (session?.user?.role) !== "SUPER_ADMIN") {
        return { success: false, error: "Only Super Admin can update AI configuration" }
    }

    try {
        await prisma.secretConfig.upsert({
            where: { key: "ai_config" },
            update: { value: JSON.stringify(config) },
            create: { key: "ai_config", value: JSON.stringify(config) },
        })

        logAudit({
            action: "SETTINGS_UPDATED",
            entity: "AiConfig",
            entityId: "ai_config",
            userId: (session?.user?.id),
        })

        revalidatePath("/admin/blog/ai")
        return { success: true }
    } catch (error) {
        console.error("Failed to update AI config:", error)
        return { success: false, error: "Failed to save AI configuration" }
    }
}

// ═══════════════════════════════════════════════════════
// Secret Management (Gemini API Key)
// ═══════════════════════════════════════════════════════

export async function getSecretStatus() {
    const hasKey = await hasSecret("GEMINI_API_KEY")
    return { configured: hasKey }
}

export async function updateGeminiKey(apiKey: string) {
    const session = await verifySession()
    if (!session || (session?.user?.role) !== "SUPER_ADMIN") {
        return { success: false, error: "Only Super Admin can update API keys" }
    }

    if (!apiKey || apiKey.trim().length < 10) {
        return { success: false, error: "Invalid API key" }
    }

    const result = await setSecret("GEMINI_API_KEY", apiKey.trim())
    if (!result) return { success: false, error: "Failed to encrypt and store key" }

    logAudit({
        action: "SETTINGS_UPDATED",
        entity: "SecretConfig",
        entityId: "GEMINI_API_KEY",
        userId: (session?.user?.id),
    })

    return { success: true }
}

// ═══════════════════════════════════════════════════════
// TrendScout — AI Idea Generation
// ═══════════════════════════════════════════════════════

export interface ScoutedIdea {
    title: string
    angle: string
    keywords: string[]
    score: number
    reasoning: string
    sources: string[]
    breakdown: {
        relevance: number
        seo: number
        authority: number
        novelty: number
        clarity: number
    }
}

export async function scoutTrends(): Promise<{ success: boolean; ideas?: ScoutedIdea[]; error?: string }> {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    // Rate limiting via centralized limiter
    const userId = (session?.user?.id) || "anonymous"
    const rateCheck = await checkRateLimit(userId, "ai_scout", RATE_LIMITS.apiStandard)
    if (!rateCheck.success) {
        return { success: false, error: "Rate limit exceeded. Please wait a minute before scouting again." }
    }

    try {
        const config = await getAiConfig()
        const prompt = buildScoutPrompt(config)
        const rawResponse = await generateWithGemini(prompt)

        // Parse JSON response (strip markdown wrappers if present)
        let cleanJson = rawResponse.trim()
        if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
        }

        let rawIdeas: any[]
        try {
            rawIdeas = JSON.parse(cleanJson)
        } catch {
            return { success: false, error: "AI returned invalid format. Please try again." }
        }

        if (!Array.isArray(rawIdeas) || rawIdeas.length === 0) {
            return { success: false, error: "AI returned no ideas. Please try again." }
        }

        // Score each idea through the 5-dimension engine
        const scoredIdeas: ScoutedIdea[] = []
        for (const raw of rawIdeas.slice(0, 5)) {
            const input: ScoringInput = {
                title: raw.title || "",
                angle: raw.angle || "",
                keywords: raw.keywords || [],
                businessValueScore: raw.businessValueScore || 0,
                reasoning: raw.reasoning || "",
            }

            const scoreResult = await calculateScore(input, config.targetNiches)

            scoredIdeas.push({
                title: input.title,
                angle: input.angle,
                keywords: input.keywords,
                score: scoreResult.totalScore,
                reasoning: input.reasoning,
                sources: raw.sources || [],
                breakdown: scoreResult.breakdown,
            })
        }

        // Sort by score descending
        scoredIdeas.sort((a, b) => b.score - a.score)

        logAudit({
            action: "BLOG_POST_CREATED",
            entity: "AiScout",
            entityId: "trend_scout",
            userId,
            metadata: { ideaCount: scoredIdeas.length },
        })

        return { success: true, ideas: scoredIdeas }
    } catch (error: any) {
        console.error("Scout trends error:", error)
        return { success: false, error: error.message || "Failed to scout trends" }
    }
}

// ═══════════════════════════════════════════════════════
// Idea Management
// ═══════════════════════════════════════════════════════

export async function approveIdea(idea: ScoutedIdea) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const created = await prisma.blogIdea.create({
            data: {
                title: idea.title,
                angle: idea.angle,
                keywords: idea.keywords,
                score: idea.score,
                reasoning: idea.reasoning,
                sources: idea.sources,
                status: "APPROVED",
            },
        })

        revalidatePath("/admin/blog/ai")
        return { success: true, idea: created }
    } catch (error) {
        console.error("Failed to approve idea:", error)
        return { success: false, error: "Failed to save idea" }
    }
}

export async function rejectIdea(ideaId: string) {
    try {
        await prisma.blogIdea.update({
            where: { id: ideaId },
            data: { status: "REJECTED" },
        })
        revalidatePath("/admin/blog/ai")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to reject idea" }
    }
}

export async function getApprovedIdeas() {
    try {
        return await prisma.blogIdea.findMany({
            where: { status: "APPROVED" },
            orderBy: { score: "desc" },
        })
    } catch {
        return []
    }
}

export async function updateIdeaContent(ideaId: string, data: { title?: string; angle?: string }) {
    try {
        const idea = await prisma.blogIdea.update({
            where: { id: ideaId },
            data,
        })
        revalidatePath("/admin/blog/ai")
        return { success: true, idea }
    } catch (error) {
        return { success: false, error: "Failed to update idea" }
    }
}

// ═══════════════════════════════════════════════════════
// Draft Generation — AI writes article, human edits
// ═══════════════════════════════════════════════════════

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
        .slice(0, 80)
}

export async function generateDraft(ideaId: string): Promise<{ success: boolean; postId?: string; error?: string }> {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    const userId = (session?.user?.id) || "anonymous"
    const rateCheck = await checkRateLimit(userId, "ai_draft", RATE_LIMITS.apiStandard)
    if (!rateCheck.success) {
        return { success: false, error: "Rate limit exceeded. Please wait before generating another draft." }
    }

    try {
        const idea = await prisma.blogIdea.findUnique({ where: { id: ideaId } })
        if (!idea) return { success: false, error: "Idea not found" }
        if (idea.status !== "APPROVED") return { success: false, error: "Only approved ideas can be drafted" }

        const config = await getAiConfig()
        const prompt = buildDraftPrompt(idea.title, idea.angle, idea.keywords, config)
        let markdown = await generateWithGemini(prompt)

        // Strip markdown code block wrappers if present
        markdown = markdown.replace(/^```(?:markdown|md)?\n?/, "").replace(/\n?```$/, "")

        // Forbidden word check
        const forbidden = ["chatgpt", "openai", "language model", "artificial intelligence", "ai tool"]
        for (const word of forbidden) {
            if (markdown.toLowerCase().includes(word)) {
                markdown = markdown.replace(new RegExp(word, "gi"), "")
            }
        }

        // Generate excerpt (first 160 chars of content, stripped of markdown)
        const plainText = markdown.replace(/[#*_\[\]()>`~-]/g, "").trim()
        const excerpt = plainText.slice(0, 160).trim() + (plainText.length > 160 ? "..." : "")

        // Create blog post
        let slug = generateSlug(idea.title)
        const existing = await prisma.blogPost.findUnique({ where: { slug } })
        if (existing) slug = `${slug}-${Date.now().toString(36)}`

        const post = await prisma.blogPost.create({
            data: {
                title: idea.title,
                slug,
                excerpt,
                content: markdown,
                published: false,
                status: "DRAFT",
                updatedAt: new Date(),
            },
        })

        // Link idea to generated post
        await prisma.blogIdea.update({
            where: { id: ideaId },
            data: { status: "DRAFTED", generatedPostId: post.id },
        })

        logAudit({
            action: "BLOG_POST_CREATED",
            entity: "BlogPost",
            entityId: post.id,
            userId,
            metadata: { fromIdea: ideaId, title: post.title },
        })

        revalidatePath("/admin/blog")
        revalidatePath("/admin/blog/ai")
        return { success: true, postId: post.id }
    } catch (error: any) {
        console.error("Draft generation error:", error)
        return { success: false, error: error.message || "Failed to generate draft" }
    }
}

// ═══════════════════════════════════════════════════════
// Auto-Suggest Exclusions
// ═══════════════════════════════════════════════════════

export async function autoSuggestExclusions(): Promise<{ success: boolean; suggestions?: string[]; error?: string }> {
    const session = await verifySession()
    if (!session || (session?.user?.role) !== "SUPER_ADMIN") {
        return { success: false, error: "Only Super Admin can use auto-suggest" }
    }

    try {
        const config = await getAiConfig()
        const prompt = buildExclusionSuggestPrompt(config)
        const rawResponse = await generateWithGemini(prompt)

        let cleanJson = rawResponse.trim()
        if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
        }

        const suggestions = JSON.parse(cleanJson)
        if (!Array.isArray(suggestions)) {
            return { success: false, error: "AI returned invalid format" }
        }

        return { success: true, suggestions: suggestions.filter((s: any) => typeof s === "string") }
    } catch (error: any) {
        console.error("Auto-suggest error:", error)
        return { success: false, error: error.message || "Failed to generate suggestions" }
    }
}

// ═══════════════════════════════════════════════════════
// Raw Generation — Pure text returned to client (For BlogEditor Integration)
// ═══════════════════════════════════════════════════════

export async function generateRawDraft(topic: string, angle: string): Promise<{ success: boolean; data?: { title: string; content: string }; error?: string }> {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    const userId = (session?.user?.id) || "anonymous"
    const rateCheck = await checkRateLimit(userId, "ai_draft", RATE_LIMITS.apiStandard)
    if (!rateCheck.success) {
        return { success: false, error: "Rate limit exceeded. Please wait before generating another draft." }
    }

    try {
        const config = await getAiConfig()
        const prompt = buildDraftPrompt(topic, angle, [], config)
        let markdown = await generateWithGemini(prompt)

        // Strip markdown code block wrappers if present
        markdown = markdown.replace(/^```(?:markdown|md)?\n?/, "").replace(/\n?```$/, "")

        // Forbidden word check
        const forbidden = ["chatgpt", "openai", "language model", "artificial intelligence", "ai tool"]
        for (const word of forbidden) {
            if (markdown.toLowerCase().includes(word)) {
                markdown = markdown.replace(new RegExp(word, "gi"), "")
            }
        }

        return {
            success: true,
            data: {
                title: topic,
                content: markdown
            }
        }
    } catch (error) {
        console.error("AI Generation failed:", error)
        return { success: false, error: "Failed to generate raw draft. Check AI configuration." }
    }
}
