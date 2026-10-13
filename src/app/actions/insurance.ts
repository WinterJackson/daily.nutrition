"use server"

import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface InsuranceProviderData {
    id: string
    name: string
    logoUrl: string | null
    description: string | null
    contactInfo: string | null
    websiteUrl: string | null
    isActive: boolean
    displayOrder: number
    createdAt: Date
    updatedAt: Date
}

// ─── Helper: revalidate all pages that display insurance info ──────────────

function revalidateInsurancePages() {
    revalidatePath("/")
    revalidatePath("/services")
    revalidatePath("/booking")
    revalidatePath("/admin/settings")
}

// ─── Public ────────────────────────────────────────────────────────────────

/**
 * Fetches only ACTIVE providers in display order.
 * Called by public server components (Footer, Services page, Booking page).
 * No caching — Next.js per-request deduplication handles this at render time.
 */
export async function getActiveInsuranceProviders(): Promise<InsuranceProviderData[]> {
    try {
        return await prisma.insuranceProvider.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
        })
    } catch {
        return []
    }
}

// ─── Admin (auth-gated) ────────────────────────────────────────────────────

/**
 * Fetches ALL providers (active and inactive) for the admin panel.
 */
export async function getAllInsuranceProviders() {
    const session = await verifySession()
    if (!session) return { success: false as const, error: "Unauthorized", data: [] }

    try {
        const data = await prisma.insuranceProvider.findMany({
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        })
        return { success: true as const, data }
    } catch (error) {
        console.error("Failed to fetch insurance providers:", error)
        return { success: false as const, error: "Failed to load providers", data: [] }
    }
}

export async function createInsuranceProvider(input: {
    name: string
    logoUrl?: string | null
    description?: string | null
    contactInfo?: string | null
    websiteUrl?: string | null
    displayOrder?: number
}) {
    const session = await verifySession()
    if (!session) return { success: false as const, error: "Unauthorized" }

    const name = input.name?.trim()
    if (!name) return { success: false as const, error: "Provider name is required" }

    try {
        // Auto-set displayOrder to end of list if not provided
        let displayOrder = input.displayOrder
        if (displayOrder === undefined) {
            const last = await prisma.insuranceProvider.findFirst({
                orderBy: { displayOrder: "desc" },
                select: { displayOrder: true },
            })
            displayOrder = (last?.displayOrder ?? 0) + 1
        }

        const provider = await prisma.insuranceProvider.create({
            data: {
                name,
                logoUrl: input.logoUrl || null,
                description: input.description?.trim() || null,
                contactInfo: input.contactInfo?.trim() || null,
                websiteUrl: input.websiteUrl?.trim() || null,
                displayOrder,
                isActive: true,
            },
        })

        logAudit({
            action: "INSURANCE_PROVIDER_CREATED",
            entity: "InsuranceProvider",
            entityId: provider.id,
            userId: session.user.id,
            metadata: { name: provider.name },
        })

        revalidateInsurancePages()
        return { success: true as const, provider }
    } catch (error) {
        console.error("Failed to create insurance provider:", error)
        return { success: false as const, error: "Failed to create provider" }
    }
}

export async function updateInsuranceProvider(
    id: string,
    input: {
        name?: string
        logoUrl?: string | null
        description?: string | null
        contactInfo?: string | null
        websiteUrl?: string | null
        displayOrder?: number
    }
) {
    const session = await verifySession()
    if (!session) return { success: false as const, error: "Unauthorized" }

    try {
        const provider = await prisma.insuranceProvider.update({
            where: { id },
            data: {
                ...(input.name !== undefined && { name: input.name.trim() }),
                ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl }),
                ...(input.description !== undefined && { description: input.description?.trim() || null }),
                ...(input.contactInfo !== undefined && { contactInfo: input.contactInfo?.trim() || null }),
                ...(input.websiteUrl !== undefined && { websiteUrl: input.websiteUrl?.trim() || null }),
                ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
                updatedAt: new Date(),
            },
        })

        logAudit({
            action: "INSURANCE_PROVIDER_UPDATED",
            entity: "InsuranceProvider",
            entityId: id,
            userId: session.user.id,
            metadata: { name: provider.name },
        })

        revalidateInsurancePages()
        return { success: true as const, provider }
    } catch (error) {
        console.error("Failed to update insurance provider:", error)
        return { success: false as const, error: "Failed to update provider" }
    }
}

export async function toggleInsuranceProvider(id: string) {
    const session = await verifySession()
    if (!session) return { success: false as const, error: "Unauthorized" }

    try {
        const current = await prisma.insuranceProvider.findUnique({
            where: { id },
            select: { isActive: true, name: true },
        })
        if (!current) return { success: false as const, error: "Provider not found" }

        const provider = await prisma.insuranceProvider.update({
            where: { id },
            data: { isActive: !current.isActive, updatedAt: new Date() },
        })

        logAudit({
            action: "INSURANCE_PROVIDER_TOGGLED",
            entity: "InsuranceProvider",
            entityId: id,
            userId: session.user.id,
            metadata: { name: current.name, isActive: provider.isActive },
        })

        revalidateInsurancePages()
        return { success: true as const, provider }
    } catch (error) {
        console.error("Failed to toggle insurance provider:", error)
        return { success: false as const, error: "Failed to toggle provider" }
    }
}

export async function deleteInsuranceProvider(id: string) {
    const session = await verifySession()
    if (!session) return { success: false as const, error: "Unauthorized" }

    try {
        const provider = await prisma.insuranceProvider.findUnique({
            where: { id },
            select: { name: true },
        })

        await prisma.insuranceProvider.delete({ where: { id } })

        logAudit({
            action: "INSURANCE_PROVIDER_DELETED",
            entity: "InsuranceProvider",
            entityId: id,
            userId: session.user.id,
            metadata: { name: provider?.name },
        })

        revalidateInsurancePages()
        return { success: true as const }
    } catch (error) {
        console.error("Failed to delete insurance provider:", error)
        return { success: false as const, error: "Failed to delete provider" }
    }
}

export async function reorderInsuranceProviders(orderedIds: string[]) {
    const session = await verifySession()
    if (!session) return { success: false as const, error: "Unauthorized" }

    try {
        await Promise.all(
            orderedIds.map((id, index) =>
                prisma.insuranceProvider.update({
                    where: { id },
                    data: { displayOrder: index, updatedAt: new Date() },
                })
            )
        )

        logAudit({
            action: "INSURANCE_PROVIDERS_REORDERED",
            entity: "InsuranceProvider",
            entityId: "batch",
            userId: session.user.id,
            metadata: { count: orderedIds.length },
        })

        revalidateInsurancePages()
        return { success: true as const }
    } catch (error) {
        console.error("Failed to reorder insurance providers:", error)
        return { success: false as const, error: "Failed to reorder providers" }
    }
}
