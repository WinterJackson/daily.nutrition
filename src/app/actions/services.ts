"use server"

import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getServices(includeHidden = false) {
    try {
        return await prisma.service.findMany({
            where: includeHidden ? { deletedAt: null } : { isVisible: true, deletedAt: null },
            orderBy: { displayOrder: 'asc' },
        })
    } catch {
        return []
    }
}

export async function getService(id: string) {
    try {
        return await prisma.service.findUnique({ where: { id } })
    } catch {
        return null
    }
}

export async function getServiceBySlug(slug: string) {
    try {
        return await prisma.service.findUnique({ where: { slug } })
    } catch {
        return null
    }
}

export async function updateService(id: string, data: {
    title?: string
    shortDescription?: string
    fullDescription?: string | null
    features?: string[]
    targetAudience?: string | null
    icon?: string
    color?: string
    bgColor?: string
    priceVirtual?: number | null
    priceInPerson?: number | null
    isVisible?: boolean
    image?: string | null
    displayOrder?: number
    version?: number
}) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Optimistic locking
        if (data.version !== undefined) {
            const current = await prisma.service.findUnique({ where: { id }, select: { version: true } })
            if (current && current.version !== data.version) {
                return { success: false, error: "This service was modified by another user. Please refresh and try again." }
            }
        }

        const { version: _v, ...updateData } = data
        const service = await prisma.service.update({
            where: { id },
            data: { ...updateData, version: { increment: 1 } },
        })

        logAudit({
            action: "SERVICE_UPDATED",
            entity: "Service",
            entityId: service.id,
            userId: (session?.user?.id),
            metadata: { title: service.title },
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
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const service = await prisma.service.findUnique({ where: { id } })
        if (!service) return { success: false, error: "Service not found" }

        const updated = await prisma.service.update({
            where: { id },
            data: { isVisible: !service.isVisible },
        })

        logAudit({
            action: "SERVICE_VISIBILITY_TOGGLED",
            entity: "Service",
            entityId: id,
            userId: (session?.user?.id),
            metadata: { isVisible: updated.isVisible },
        })

        revalidatePath("/admin/services")
        revalidatePath("/services")
        revalidatePath("/")
        return { success: true, service: updated }
    } catch (error) {
        console.error("Failed to toggle service visibility:", error)
        return { success: false, error: "Failed to toggle service visibility" }
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
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    // Zod validation
    let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `service-${Date.now()}`
    const validated = serviceSchema.partial().safeParse({ ...data, slug })
    if (!validated.success) {
        return { success: false, error: validated.error.issues.map(e => e.message).join(", ") }
    }

    try {
        // Auto-increment slug to avoid Unique Constraint collisions
        let baseSlug = slug
        let suffix = 1
        while (await prisma.service.findUnique({ where: { slug } })) {
            suffix++
            slug = `${baseSlug}-${suffix}`
        }

        const service = await prisma.service.create({
            data: {
                id: slug,
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
                bgColor: "bg-brand-green/10",
                updatedAt: new Date()
            },
        })

        logAudit({
            action: "SERVICE_CREATED",
            entity: "Service",
            entityId: service.id,
            userId: (session?.user?.id),
            metadata: { title: service.title },
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

// Soft-delete
export async function deleteService(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.service.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        logAudit({
            action: "SERVICE_DELETED",
            entity: "Service",
            entityId: id,
            userId: (session?.user?.id),
        })

        revalidatePath("/admin/services")
        revalidatePath("/services")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete service:", error)
        return { success: false, error: "Failed to delete service" }
    }
}
