"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type TestimonialStatus = "PENDING" | "APPROVED" | "ARCHIVED"

export async function getTestimonials(status?: TestimonialStatus, page = 1, pageSize = 10) {
    try {
        const where = status ? { status } : undefined
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
    const result = await getTestimonials("APPROVED")
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
    try {
        const testimonial = await prisma.testimonial.create({
            data: {
                authorName: data.authorName,
                rating: data.rating,
                content: data.content,
                serviceId: data.serviceId || null,
                status: data.status || "PENDING",
            },
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
    try {
        const testimonial = await prisma.testimonial.update({
            where: { id },
            data,
        })
        revalidatePath("/admin/testimonials")
        revalidatePath("/")
        return { success: true, testimonial }
    } catch (error) {
        console.error("Failed to update testimonial:", error)
        return { success: false, error: "Failed to update testimonial" }
    }
}

export async function deleteTestimonial(id: string) {
    try {
        await prisma.testimonial.delete({ where: { id } })
        revalidatePath("/admin/testimonials")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete testimonial:", error)
        return { success: false, error: "Failed to delete testimonial" }
    }
}
