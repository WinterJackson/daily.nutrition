"use server"

import { MainEmailLayout } from "@/components/email/MainEmailLayout"
import { verifySession } from "@/lib/auth"
import { getResendClient } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { NewsletterService } from "@/lib/services/newsletter-service"
import { CampaignTarget } from "@prisma/client"
import { Text } from "@react-email/components"
import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"

export async function getNewsletterData(page = 1, pageSize = 20, filter: "ALL" | "ACTIVE" | "UNSUBSCRIBED" = "ALL", search = "") {
    const session = await verifySession()
    if (!session) throw new Error("Unauthorized")

    try {
        const where: any = { deletedAt: null }

        if (filter === "ACTIVE") where.isActive = true
        if (filter === "UNSUBSCRIBED") where.isActive = false

        if (search) {
            where.email = { contains: search, mode: "insensitive" }
        }

        const [subscribers, totalCount, quotaInfo, campaigns] = await Promise.all([
            prisma.newsletterSubscriber.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.newsletterSubscriber.count({ where }),
            NewsletterService.getResendQuota(),
            prisma.newsletterCampaign.findMany({
                orderBy: { createdAt: "desc" },
                take: 10
            })
        ])

        return { subscribers, totalCount, quotaInfo, campaigns }
    } catch (error) {
        console.error("Failed to fetch newsletter data:", error)
        throw new Error("Failed to load newsletter system")
    }
}

export async function deleteSubscriberAction(id: string) {
    const session = await verifySession()
    if (!session) throw new Error("Unauthorized")

    try {
        await NewsletterService.deleteSubscriber(id)
        revalidatePath("/admin/newsletter")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete subscriber" }
    }
}

export async function draftCampaign(data: { subject: string; previewText?: string; content: string; targetAudience: CampaignTarget }) {
    const session = await verifySession()
    if (!session) throw new Error("Unauthorized")

    try {
        await prisma.newsletterCampaign.create({
            data: {
                subject: data.subject,
                previewText: data.previewText,
                content: data.content,
                targetAudience: data.targetAudience,
                status: "DRAFT"
            }
        })
        revalidatePath("/admin/newsletter")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to draft campaign" }
    }
}

export async function dispatchCampaign(campaignId: string) {
    const session = await verifySession()
    if (!session) throw new Error("Unauthorized")

    try {
        const campaign = await prisma.newsletterCampaign.findUnique({ where: { id: campaignId } })
        if (!campaign || campaign.status !== "DRAFT") throw new Error("Invalid campaign or not in DRAFT status")

        const quota = await NewsletterService.getResendQuota()

        // Find Target Audience
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                // If specific targeting logic exists, apply here. For now, ACTIVE_ONLY is default.
            },
            select: { email: true }
        })

        if (subscribers.length === 0) throw new Error("No active subscribers found")

        // Block if attempting to send more than mathematical capacity
        if (subscribers.length > quota.maxSendableCapacity) {
            throw new Error(`CRITICAL: Dispatch blocked. Attempting to send ${subscribers.length} emails, but only ${quota.maxSendableCapacity} remaining in API Quota.`)
        }

        // Move to SENDING state
        await prisma.newsletterCampaign.update({
            where: { id: campaignId },
            data: { status: "SENDING" }
        })

        const { resend, fromEmail } = await getResendClient()
        if (!resend) throw new Error("Resend is not configured")

        // Render React Email
        const htmlContent = await render(
            MainEmailLayout({
                previewText: campaign.previewText || campaign.subject,
                heading: campaign.subject,
                children: Text({ children: campaign.content }) // In a full app, parse markdown to React-Email components
            })
        )

        const crypto = await import("crypto")
        const secret = process.env.ENCRYPTION_KEY || "fallback_secret_key_for_dev_only"
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://edwaknutrition.co.ke"

        const brandingSettings = await prisma.siteSettings.findUnique({ where: { id: "default" }, include: { EmailBranding: true } });
        const replyToEmail = brandingSettings?.EmailBranding?.supportEmail || fromEmail;

        const emailsToSend = subscribers.map(sub => {
            const token = crypto.createHmac("sha256", secret).update(sub.email).digest("hex")
            const unsubscribeUrl = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${token}`

            const personalizedHtml = htmlContent.replace(
                "</body>",
                `<div style="text-align: center; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #888; font-family: sans-serif;">
                    <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe from these emails</a>
                </div></body>`
            )

            return {
                from: `Edwak Nutrition <${fromEmail}>`,
                to: sub.email,
                replyTo: replyToEmail,
                subject: campaign.subject,
                html: personalizedHtml
            }
        })

        // Resend batch send (Max 100 per API call typically)
        const batchSize = 100
        let sentCount = 0

        for (let i = 0; i < emailsToSend.length; i += batchSize) {
            const batch = emailsToSend.slice(i, i + batchSize)
            await resend.batch.send(batch)
            sentCount += batch.length
        }

        // Mark as SENT and record the Exact Send Count
        await prisma.newsletterCampaign.update({
            where: { id: campaignId },
            data: {
                status: "SENT",
                sentAt: new Date(),
                sentCount: sentCount
            }
        })

        revalidatePath("/admin/newsletter")
        return { success: true, sentCount }
    } catch (error) {
        console.error("Dispatch Failed:", error)

        // Revert to draft if failed
        await prisma.newsletterCampaign.update({
            where: { id: campaignId },
            data: { status: "DRAFT" }
        })

        return { success: false, error: error instanceof Error ? error.message : "Failed to dispatch campaign" }
    }
}
