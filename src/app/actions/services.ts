"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getServices(includeHidden = false) {
    try {
        return await prisma.service.findMany({
            where: includeHidden ? undefined : { isVisible: true },
            orderBy: { displayOrder: 'asc' },
        })
    } catch (error) {
        console.error("Failed to fetch services:", error)
        return []
    }
}

export async function getService(id: string) {
    try {
        return await prisma.service.findUnique({ where: { id } })
    } catch (error) {
        console.error("Failed to fetch service:", error)
        return null
    }
}

export async function getServiceBySlug(slug: string) {
    try {
        return await prisma.service.findUnique({ where: { slug } })
    } catch (error) {
        console.error("Failed to fetch service by slug:", error)
        return null
    }
}

export async function updateService(id: string, data: {
    title?: string
    shortDescription?: string
    fullDescription?: string
    features?: string[]
    targetAudience?: string
    icon?: string
    color?: string
    bgColor?: string
    priceVirtual?: number
    priceInPerson?: number
    isVisible?: boolean
    displayOrder?: number
}) {
    try {
        const service = await prisma.service.update({
            where: { id },
            data,
        })
        revalidatePath("/admin/services")
        revalidatePath("/services")
        revalidatePath("/")
        return { success: true, service }
    } catch (error) {
        console.error("Failed to update service:", error)
        return { success: false, error: "Failed to update service" }
    }
}

export async function toggleServiceVisibility(id: string) {
    try {
        const service = await prisma.service.findUnique({ where: { id } })
        if (!service) return { success: false, error: "Service not found" }

        const updated = await prisma.service.update({
            where: { id },
            data: { isVisible: !service.isVisible },
        })
        revalidatePath("/admin/services")
        revalidatePath("/services")
        revalidatePath("/")
        return { success: true, service: updated }
    } catch (error) {
        console.error("Failed to toggle service visibility:", error)
    }
}

export async function createService(data: {
    title: string
    shortDescription: string
    fullDescription?: string
    features?: string[]
    targetAudience?: string
    priceVirtual?: number
    priceInPerson?: number
    isVisible?: boolean
}) {
    try {
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `service-${Date.now()}`

        // Check if slug exists
        const existing = await prisma.service.findUnique({ where: { slug } })
        if (existing) {
            // Append random string to make unique
            return { success: false, error: "A service with this title already exists" }
        }

        const service = await prisma.service.create({
            data: {
                id: slug, // Using slug as ID pattern
                slug,
                title: data.title,
                shortDescription: data.shortDescription,
                fullDescription: data.fullDescription,
                features: data.features || [],
                targetAudience: data.targetAudience,
                priceVirtual: data.priceVirtual,
                priceInPerson: data.priceInPerson,
                isVisible: data.isVisible ?? true,
                icon: "Activity",
                color: "text-brand-green",
                bgColor: "bg-brand-green/10"
            },
        })
        revalidatePath("/admin/services")
        revalidatePath("/services")
        revalidatePath("/")
        return { success: true, service }
    } catch (error) {
        console.error("Failed to create service:", error)
        return { success: false, error: "Failed to create service" }
    }
}

export async function deleteService(id: string) {
    try {
        await prisma.service.delete({ where: { id } })
        revalidatePath("/admin/services")
        revalidatePath("/services")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete service:", error)
        return { success: false, error: "Failed to delete service" }
    }
}
