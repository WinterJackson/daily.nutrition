"use server"

import { verifySession, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Xinteck Pattern: Audit Log Actions
 * Read-only actions for the admin audit log viewer.
 */

export async function getAuditLogs(page = 1, pageSize = 25, filters?: {
    action?: string
    entity?: string
    userId?: string
    startDate?: Date
    endDate?: Date
}) {
    const session = await verifySession()
    if (!session) return { logs: [], totalCount: 0 }

    try {
        const where: any = {}

        if (filters?.action) where.action = filters.action
        if (filters?.entity) where.entity = filters.entity
        if (filters?.userId) where.userId = filters.userId
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {}
            if (filters.startDate) where.createdAt.gte = filters.startDate
            if (filters.endDate) where.createdAt.lte = filters.endDate
        }

        const [logs, totalCount] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.auditLog.count({ where }),
        ])

        return { logs, totalCount }
    } catch (error) {
        console.error("Failed to fetch audit logs:", error)
        return { logs: [], totalCount: 0 }
    }
}

export async function exportAuditLogsCsv(filters?: {
    action?: string
    entity?: string
    startDate?: Date
    endDate?: Date
}) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const where: any = {}
        if (filters?.action) where.action = filters.action
        if (filters?.entity) where.entity = filters.entity
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {}
            if (filters?.startDate) where.createdAt.gte = filters.startDate
            if (filters?.endDate) where.createdAt.lte = filters.endDate
        }

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 10000, // Safety cap
        })

        const header = "Timestamp,Action,Entity,EntityID,UserID,IP Address,Metadata\n"
        const rows = logs.map(log =>
            `"${log.createdAt.toISOString()}","${log.action}","${log.entity}","${log.entityId}","${log.userId || ""}","${log.ipAddress || ""}","${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`
        ).join("\n")

        return { success: true, csv: header + rows }
    } catch (error) {
        console.error("Failed to export audit logs:", error)
        return { success: false, error: "Export failed" }
    }
}
