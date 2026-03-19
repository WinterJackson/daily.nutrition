"use server"

import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { testimonialSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export type TestimonialStatus = "IN_REVIEW" | "PUBLISHED" | "ARCHIVED"

export async function getTestimonials(status?: TestimonialStatus, page = 1, pageSize = 10) {
    try {
        const where: any = { deletedAt: null }
        if (status) where.contentStatus = status

        const [testimonials, totalCount] = await Promise.all([
            prisma.testimonial.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.testimonial.count({ where }),
        ])
        return { testimonials, totalCount }
    } catch (error) {
        console.error("Failed to fetch testimonials:", error)
        return { testimonials: [], totalCount: 0 }
    }
}

export async function getApprovedTestimonials() {
    const result = await getTestimonials("PUBLISHED")
    return result.testimonials
}

export async function getTestimonial(id: string) {
    try {
        return await prisma.testimonial.findUnique({ where: { id } })
    } catch (error) {
        console.error("Failed to fetch testimonial:", error)
        return null
    }
}

export async function createTestimonial(data: {
    authorName: string
    rating: number
    content: string
    serviceId?: string
    status?: TestimonialStatus
}) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    // Zod validation
    const validated = testimonialSchema.partial().safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.issues.map(e => e.message).join(", ") }
    }

    try {
        const testimonial = await prisma.testimonial.create({
            data: {
                authorName: data.authorName,
                rating: data.rating,
                content: data.content,
                serviceId: data.serviceId || null,
                contentStatus: data.status || "IN_REVIEW",
            },
        })

        logAudit({
            action: "TESTIMONIAL_CREATED",
            entity: "Testimonial",
            entityId: testimonial.id,
            metadata: { authorName: data.authorName },
        })

        revalidatePath("/admin/testimonials")
        revalidatePath("/")
        return { success: true, testimonial }
    } catch (error) {
        console.error("Failed to create testimonial:", error)
        return { success: false, error: "Failed to create testimonial" }
    }
}

export async function updateTestimonial(id: string, data: {
    authorName?: string
    rating?: number
    content?: string
    serviceId?: string
    status?: TestimonialStatus
}) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const { status, ...rest } = data
        const updateData: any = { ...rest }
        if (status) updateData.contentStatus = status

        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: updateData,
        })

        logAudit({
            action: "TESTIMONIAL_UPDATED",
            entity: "Testimonial",
            entityId: id,
            metadata: { status },
        })

        revalidatePath("/admin/testimonials")
        revalidatePath("/")
        return { success: true, testimonial }
    } catch (error) {
        console.error("Failed to update testimonial:", error)
        return { success: false, error: "Failed to update testimonial" }
    }
}

// Soft-delete
export async function deleteTestimonial(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.testimonial.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        logAudit({
            action: "TESTIMONIAL_DELETED",
            entity: "Testimonial",
            entityId: id,
        })

        revalidatePath("/admin/testimonials")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete testimonial:", error)
        return { success: false, error: "Failed to delete testimonial" }
    }
}

// --- Google Reviews Sync Engine ---

export async function getGoogleReviewsSyncStatus() {
    const session = await verifySession()
    if (!session) return { configured: false, placeId: "" }

    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" }, select: { googlePlaceId: true } })
    const { INTERNAL_getSecret } = await import("@/lib/ai/secrets")
    const hasKey = !!(await INTERNAL_getSecret("GOOGLE_MAPS_API_KEY"))

    return {
        configured: hasKey && !!settings?.googlePlaceId,
        placeId: settings?.googlePlaceId || ""
    }
}

export async function syncGoogleReviews() {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // 1. Get Place ID from settings
        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" }, select: { googlePlaceId: true } })
        if (!settings?.googlePlaceId) {
            return { success: false, error: "Google Place ID is not configured. Go to Settings → Integrations to set it up." }
        }

        // 2. Get API key from encrypted secrets
        const { INTERNAL_getSecret } = await import("@/lib/ai/secrets")
        const apiKey = await INTERNAL_getSecret("GOOGLE_MAPS_API_KEY")
        if (!apiKey) {
            return { success: false, error: "Google Maps API Key is not configured. Go to Settings → Integrations to set it up." }
        }

        // 3. Fetch reviews from Google Places API
        const placeId = settings.googlePlaceId
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${apiKey}`

        const response = await fetch(url, { cache: "no-store" })
        if (!response.ok) {
            return { success: false, error: `Google API returned status ${response.status}. Check your API key and Place ID.` }
        }

        const data = await response.json()

        if (data.status !== "OK") {
            return { success: false, error: `Google API error: ${data.status}. ${data.error_message || "Check your Place ID and ensure the Places API is enabled."}` }
        }

        const reviews = data.result?.reviews
        if (!reviews || reviews.length === 0) {
            return { success: false, error: "No reviews found for this Place ID. Your business may not have any Google reviews yet." }
        }

        // 4. Upsert reviews into the Testimonial table
        let synced = 0
        let skipped = 0

        for (const review of reviews) {
            // Specifically ignore reviews without text as they break the website UI slider
            if (!review.text || review.text.trim() === "") {
                skipped++
                continue
            }

            // Extract unique reviewer ID from Google Maps profile URL to handle review edits gracefully
            const contribIdMatch = review.author_url?.match(/contrib\/([0-9]+)/)
            // Hardened fallback to strip non-alphanumeric chars (e.g., emojis or foreign scripts) safely if contrib ID fails
            const reviewerId = contribIdMatch ? contribIdMatch[1] : (review.author_name || "unknown").replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

            // Deterministic ID to prevent duplicates and allow updates
            const reviewId = `google-${placeId.slice(-8)}-${reviewerId}`

            const existing = await prisma.testimonial.findUnique({ where: { id: reviewId } })

            if (existing) {
                // If they updated their review on Google, sync the new content, rating, and updated timestamp
                if (existing.content !== review.text || existing.rating !== review.rating) {
                    await prisma.testimonial.update({
                        where: { id: reviewId },
                        data: {
                            content: review.text,
                            rating: review.rating || 5,
                            // Preserve the true original review date (or updated date) if available
                            ...(review.time ? { createdAt: new Date(review.time * 1000) } : {}),
                            // Intentionally DO NOT modify contentStatus. If it was PUBLISHED, keep it PUBLISHED.
                        }
                    })
                    synced++
                } else {
                    skipped++
                }
            } else {
                // Create brand new review entry, requires admin approval
                await prisma.testimonial.create({
                    data: {
                        id: reviewId,
                        authorName: review.author_name || "Google Reviewer",
                        rating: review.rating || 5,
                        content: review.text,
                        contentStatus: "IN_REVIEW",
                        // Sync the EXACT historical date the review was left on Google
                        ...(review.time ? { createdAt: new Date(review.time * 1000) } : {}),
                    }
                })
                synced++
            }
        }

        logAudit({
            action: "GOOGLE_REVIEWS_SYNCED",
            entity: "Testimonial",
            entityId: placeId,
            userId: session.user.id,
            metadata: { synced, skipped, totalFromGoogle: reviews.length },
        })

        revalidatePath("/admin/testimonials")
        revalidatePath("/")

        return {
            success: true,
            message: `Synced ${synced} new review(s). ${skipped} already existed.`,
            synced,
            skipped,
            total: reviews.length
        }
    } catch (error) {
        console.error("Failed to sync Google reviews:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to sync Google reviews" }
    }
}
