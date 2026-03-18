/**
 * Xinteck Pattern: AI Prompt Templates
 * All prompts are deeply tuned for a Kenyan nutrition consultancy (Daily Nutrition)
 * targeting professional, evidence-based content for the East African market.
 */

export interface AiConfig {
    targetNiches: string[]
    excludedKeywords: string[]
    brandVoice: string
}

export const DEFAULT_AI_CONFIG: AiConfig = {
    targetNiches: [
        "Clinical Nutrition in Kenya",
        "Diabetes Management (Type 2)",
        "Oncology Nutrition Support",
        "Digestive & Gut Health",
        "Weight Management for Kenyan Diets",
        "Maternal & Child Nutrition",
        "Sports Nutrition for Kenyan Athletes",
    ],
    excludedKeywords: [
        "cheap supplements",
        "quick fix",
        "miracle cure",
        "detox tea",
        "weight loss pills",
        "MLM",
        "network marketing",
        "fad diet",
        "crash diet",
    ],
    brandVoice:
        "Professional, evidence-based, and empathetic. Speaks with clinical authority but remains accessible to Kenyan families. Uses East African food examples (ugali, sukuma wiki, nyama choma, chapati, githeri). References Kenyan health statistics and local dietary patterns. Avoids Western-centric dietary advice.",
}

/**
 * SCOUT_PROMPT_TEMPLATE
 * Asks Gemini to generate 5 trending nutrition content ideas
 * relevant to the Kenyan market with business value scoring.
 */
export function buildScoutPrompt(config: AiConfig): string {
    return `You are a senior content strategist for "Daily Nutrition," a premium clinical nutrition consultancy based in Nairobi, Kenya. Your audience is health-conscious Kenyan professionals, families managing chronic conditions, and corporate wellness programs across East Africa.

TARGET NICHES (focus your research here):
${config.targetNiches.map((n) => `- ${n}`).join("\n")}

STRICTLY EXCLUDED TOPICS (never suggest anything related to):
${config.excludedKeywords.map((k) => `- ${k}`).join("\n")}

BRAND VOICE: ${config.brandVoice}

YOUR TASK:
Generate exactly 5 emerging nutrition content ideas that would position Daily Nutrition as a thought leader in the Kenyan nutrition space. Each idea must be:
1. Timely and relevant to current Kenyan health trends (2024-2026)
2. Backed by evidence or emerging research
3. Aligned with our premium, clinical positioning
4. Actionable for Kenyan readers with local food examples

Respond ONLY in this exact JSON format (no markdown wrappers, no explanation):
[
  {
    "title": "Clear, SEO-optimized title (50-70 chars)",
    "angle": "The unique hook or reasoning why this matters NOW for Kenyan audiences (2-3 sentences)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "businessValueScore": 85,
    "reasoning": "Why this scores high: relevance to our niches, search potential, authority positioning (1-2 sentences)",
    "sources": ["https://example.com/study"]
  }
]

SCORING GUIDELINES for businessValueScore (0-100):
- 90-100: Directly addresses a Kenyan health crisis with clinical depth
- 70-89: Strong SEO potential + aligns with our specialties
- 50-69: Good content but may not differentiate us
- Below 50: Too generic or off-brand

IMPORTANT: Each idea must be DISTINCT — no overlapping topics. Prioritize long-tail keywords that a Kenyan audience would actually search for (e.g., "managing diabetes with Kenyan diet" over generic "diabetes tips").`
}

/**
 * DRAFT_PROMPT_TEMPLATE
 * Instructs Gemini to write a 700-1000 word article in raw Markdown.
 */
export function buildDraftPrompt(
    title: string,
    angle: string,
    keywords: string[],
    config: AiConfig
): string {
    return `You are the lead clinical nutritionist and content writer for "Daily Nutrition," a premier nutrition consultancy in Nairobi, Kenya. Write a professional blog article in RAW MARKDOWN (not wrapped in code blocks).

ARTICLE DETAILS:
- Title: ${title}
- Angle: ${angle}
- Target Keywords (weave naturally, never stuff): ${keywords.join(", ")}

BRAND VOICE: ${config.brandVoice}

STRICT REQUIREMENTS:
1. LENGTH: 700-1000 words. Not shorter, not significantly longer.
2. FORMAT: Raw Markdown only. Use ## for sections, **bold** for emphasis, > for callouts.
3. STRUCTURE (follow this exactly):
   - Opening paragraph: Hook the reader with a relatable Kenyan scenario
   - ## The Challenge: What problem does the reader face? Use Kenyan health statistics.
   - ## The Approach: Evidence-based nutritional strategies. Include specific Kenyan foods (ugali, sukuma wiki, nyama choma, omena, avocado, sweet potato, arrow roots, green grams, cowpeas, millet, sorghum).
   - ## The Impact: What results can readers expect? Include a practical meal plan or action steps.
   - ## Key Takeaways: 3-4 bullet points summarizing the article.
   - Closing paragraph: Gentle call-to-action to book a consultation at Daily Nutrition.
4. TONE: Clinical authority with warmth. Cite real nutrient values and health mechanisms.
5. NEVER use: "${config.excludedKeywords.join('", "')}"
6. NEVER mention: ChatGPT, AI, artificial intelligence, language model, or any AI tool.
7. Include Kenyan-specific context: reference KNH, KEMRI research where relevant, Kenyan dietary guidelines.
8. Use metric units (kg, g, ml) as standard in Kenya.

Write the article now. Output RAW MARKDOWN only — no code blocks, no explanations before or after.`
}

/**
 * EXCLUSION_SUGGEST_PROMPT
 * Auto-suggest keywords the brand should blacklist.
 */
export function buildExclusionSuggestPrompt(config: AiConfig): string {
    return `You are a brand strategist for "Daily Nutrition," a premium clinical nutrition consultancy in Nairobi, Kenya.

OUR POSITIONING: Evidence-based, premium, clinical authority in the Kenyan nutrition space.

OUR TARGET NICHES:
${config.targetNiches.map((n) => `- ${n}`).join("\n")}

OUR BRAND VOICE: ${config.brandVoice}

CURRENTLY EXCLUDED KEYWORDS:
${config.excludedKeywords.map((k) => `- ${k}`).join("\n")}

TASK: Analyze our brand positioning and suggest 10 ADDITIONAL keywords or phrases we should blacklist from our content to protect our premium, evidence-based image. These should be terms that:
1. Undermine clinical credibility
2. Attract the wrong audience (people seeking quick fixes, not professional care)
3. Could damage our reputation in the Kenyan healthcare community
4. Are associated with unregulated supplements or products common in Kenyan markets

Respond ONLY as a JSON array of strings. No explanations, no markdown:
["keyword1", "keyword2", "keyword3", ...]`
}
