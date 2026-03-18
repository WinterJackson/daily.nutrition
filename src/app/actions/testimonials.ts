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
