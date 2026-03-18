import { prisma } from "@/lib/prisma"

export interface SendCampaignParams {
    campaignId: string
    adminId: string
}

export class NewsletterService {
    /**
     * CRITICAL FEATURE: Resend Quota Tracking Engine
     * Calculates the exact number of emails sent today and this month.
     * Uses Prisma aggregates dynamically to prevent free-tier blocks.
     */
    static async getResendQuota() {
        // Time Boundaries
        const now = new Date()

        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Aggregations
        const [dailyStats, monthlyStats, activeSubscribers] = await Promise.all([
            prisma.newsletterCampaign.aggregate({
                _sum: { sentCount: true },
                where: { sentAt: { gte: startOfDay }, status: "SENT" }
            }),
            prisma.newsletterCampaign.aggregate({
                _sum: { sentCount: true },
                where: { sentAt: { gte: startOfMonth }, status: "SENT" }
            }),
            prisma.newsletterSubscriber.count({
                where: { isActive: true, deletedAt: null }
            })
        ])

        const dailySent = dailyStats._sum.sentCount || 0
        const monthlySent = monthlyStats._sum.sentCount || 0

        // Strict Enforcement (Assuming Resend Free Tier: 100/day, 3000/month)
        const dailyRemaining = Math.max(0, 100 - dailySent)
        const monthlyRemaining = Math.max(0, 3000 - monthlySent)

        const maxSendableCapacity = Math.min(dailyRemaining, monthlyRemaining)

        return {
            dailySent,
            dailyLimit: 100,
            dailyRemaining,
            monthlySent,
            monthlyLimit: 3000,
            monthlyRemaining,
            activeSubscribers,
            maxSendableCapacity,
            canSendToAll: maxSendableCapacity >= activeSubscribers
        }
    }

    /**
     * Soft deletes a subscriber (GDPR compliance)
     */
    static async deleteSubscriber(id: string) {
        return prisma.newsletterSubscriber.update({
            where: { id },
            data: {
                isActive: false,
                deletedAt: new Date(),
                unsubscribedAt: new Date()
            }
        })
    }

    /**
     * Unsubscribes a user (Analytics retention)
     */
    static async unsubscribe(email: string) {
        return prisma.newsletterSubscriber.update({
            where: { email },
            data: {
                isActive: false,
                unsubscribedAt: new Date()
            }
        })
    }
}
