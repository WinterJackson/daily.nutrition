/**
 * Xinteck Pattern: 5-Dimension Scoring Engine
 * Evaluates AI-generated blog ideas on 5 axes:
 * Relevance (35%), SEO (20%), Authority (20%), Novelty (15%), Clarity (10%)
 */

import { prisma } from "@/lib/prisma"

export interface ScoringInput {
    title: string
    angle: string
    keywords: string[]
    businessValueScore: number
    reasoning: string
}

export interface ScoringResult {
    totalScore: number
    breakdown: {
        relevance: number
        seo: number
        authority: number
        novelty: number
        clarity: number
    }
}

/**
 * Core scoring weights
 */
const WEIGHTS = {
    relevance: 0.35,
    seo: 0.20,
    authority: 0.20,
    novelty: 0.15,
    clarity: 0.10,
}

// Kenyan nutrition authority terms
const AUTHORITY_TERMS = [
    "clinical", "evidence-based", "research", "nutritionist", "dietitian",
    "metabolic", "glycemic", "micronutrient", "macronutrient", "bioavailability",
    "gut microbiome", "insulin resistance", "intervention", "protocol",
    "therapeutic", "pathophysiology", "nutrient density", "management",
    "assessment", "counseling", "KEMRI", "KNH", "WHO",
]

// Terms that indicate beginner/generic content
const BEGINNER_TERMS = [
    "tutorial", "beginner", "simple tips", "easy tricks",
    "hack", "cheat", "shortcut", "basic", "101",
]

// SEO intent words (high search value)
const INTENT_WORDS = [
    "how to", "best", "guide", "plan", "manage", "prevent",
    "treatment", "diet for", "foods for", "nutrition for",
    "what to eat", "meal plan",
]

/**
 * Calculate the 5-dimension score for a blog idea.
 */
export async function calculateScore(
    idea: ScoringInput,
    targetNiches: string[]
): Promise<ScoringResult> {
    const titleLower = idea.title.toLowerCase()
    const angleLower = idea.angle.toLowerCase()
    const combined = `${titleLower} ${angleLower} ${idea.keywords.join(" ").toLowerCase()}`

    // 1. RELEVANCE (35%) — How well does this align with target niches?
    const relevanceScore = calculateRelevance(combined, targetNiches)

    // 2. SEO (20%) — Keyword quality and search intent
    const seoScore = calculateSeo(idea.keywords, combined)

    // 3. AUTHORITY (20%) — Does this position us as experts?
    const authorityScore = calculateAuthority(combined)

    // 4. NOVELTY (15%) — Is this topic fresh? (DB collision check)
    const noveltyScore = await calculateNovelty(idea.title)

    // 5. CLARITY (10%) — Is the title clear and well-formed?
    const clarityScore = calculateClarity(idea.title)

    const totalScore = Math.round(
        relevanceScore * WEIGHTS.relevance +
        seoScore * WEIGHTS.seo +
        authorityScore * WEIGHTS.authority +
        noveltyScore * WEIGHTS.novelty +
        clarityScore * WEIGHTS.clarity
    )

    return {
        totalScore: Math.min(100, Math.max(0, totalScore)),
        breakdown: {
            relevance: Math.round(relevanceScore),
            seo: Math.round(seoScore),
            authority: Math.round(authorityScore),
            novelty: Math.round(noveltyScore),
            clarity: Math.round(clarityScore),
        },
    }
}

/**
 * Relevance: text matching against core niches
 */
function calculateRelevance(combined: string, niches: string[]): number {
    let matches = 0
    const nicheWords = niches.flatMap((n) =>
        n.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    )

    for (const word of nicheWords) {
        if (combined.includes(word)) matches++
    }

    const ratio = nicheWords.length > 0 ? matches / nicheWords.length : 0
    return Math.min(100, ratio * 200) // Scale so 50% match = 100
}

/**
 * SEO: Keyword count, long-tail analysis, and intent words
 */
function calculateSeo(keywords: string[], combined: string): number {
    let score = 0

    // Keyword count bonus (4-6 ideal)
    if (keywords.length >= 4 && keywords.length <= 6) score += 30
    else if (keywords.length >= 2) score += 15

    // Long-tail keyword bonus (multi-word keywords)
    const longTail = keywords.filter((k) => k.split(" ").length >= 3)
    score += longTail.length * 15

    // Intent word bonus
    for (const intent of INTENT_WORDS) {
        if (combined.includes(intent)) {
            score += 8
            break // Max one intent bonus
        }
    }

    // Additional keyword relevance
    score += Math.min(20, keywords.length * 5)

    return Math.min(100, score)
}

/**
 * Authority: Expert terms vs beginner terms
 */
function calculateAuthority(combined: string): number {
    let score = 50 // Base

    for (const term of AUTHORITY_TERMS) {
        if (combined.includes(term.toLowerCase())) score += 8
    }

    for (const term of BEGINNER_TERMS) {
        if (combined.includes(term.toLowerCase())) score -= 15
    }

    return Math.min(100, Math.max(0, score))
}

/**
 * Novelty: Queries DB for topic collisions with existing posts.
 * If the topic has been written about, score drops significantly.
 */
async function calculateNovelty(title: string): Promise<number> {
    try {
        const titleWords = title
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3)

        if (titleWords.length === 0) return 80

        // Check each significant word against existing post titles
        const existingPosts = await prisma.blogPost.findMany({
            where: { deletedAt: null },
            select: { title: true },
        })

        let collisions = 0
        const existingTitles = existingPosts.map((p) => p.title.toLowerCase())

        for (const word of titleWords) {
            for (const existingTitle of existingTitles) {
                if (existingTitle.includes(word)) {
                    collisions++
                    break
                }
            }
        }

        const collisionRatio = titleWords.length > 0 ? collisions / titleWords.length : 0

        if (collisionRatio > 0.6) return 10 // Very similar to existing
        if (collisionRatio > 0.4) return 35 // Moderate overlap
        if (collisionRatio > 0.2) return 60 // Some overlap
        return 90 // Fresh topic
    } catch {
        return 70 // DB error fallback
    }
}

/**
 * Clarity: Title length and format sanity checks
 */
function calculateClarity(title: string): number {
    const len = title.length

    if (len < 20) return 30 // Too short
    if (len > 100) return 40 // Too long
    if (len >= 40 && len <= 70) return 100 // Ideal SEO length
    if (len >= 30 && len <= 80) return 80 // Good
    return 60 // Acceptable
}
