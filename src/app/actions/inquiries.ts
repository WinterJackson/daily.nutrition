"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED"

export async function getInquiries(page = 1, pageSize = 10) {
    try {
        const [inquiries, totalCount] = await Promise.all([
            prisma.inquiry.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.inquiry.count(),
        ])
        return { inquiries, totalCount }
    } catch (error) {
        console.error("Failed to fetch inquiries:", error)
        return { inquiries: [], totalCount: 0 }
    }
}

export async function getInquiry(id: string) {
    try {
        return await prisma.inquiry.findUnique({ where: { id } })
    } catch (error) {
        console.error("Failed to fetch inquiry:", error)
        return null
    }
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
    try {
        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: { status },
        })
        revalidatePath("/admin/inquiries")
        return { success: true, inquiry }
    } catch (error) {
        console.error("Failed to update inquiry status:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function deleteInquiry(id: string) {
    try {
        await prisma.inquiry.delete({ where: { id } })
        revalidatePath("/admin/inquiries")
        return { success: true }
    } catch (error) {
        console.warn("Failed to delete inquiry:", error instanceof Error ? error.message : String(error))
        return { success: false, error: "Failed to delete inquiry" }
    }
}
