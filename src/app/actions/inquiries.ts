"use server"

import { InquiryReplyEmail } from "@/components/emails/InquiryReplyEmail"
import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { getResendClient } from "@/lib/email"
import { logEmailAttempt } from "@/lib/email-logger"
import { prisma } from "@/lib/prisma"
import { NotificationService } from "@/lib/services/notification-service"
import { revalidatePath } from "next/cache"

export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED"

export async function getInquiries(page = 1, pageSize = 10) {
    try {
        const [inquiries, totalCount] = await Promise.all([
            prisma.inquiry.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    notes: { orderBy: { createdAt: "desc" } },
                    replies: { orderBy: { sentAt: "asc" } },
                    assignedTo: { select: { id: true, name: true, email: true } }
                }
            }),
            prisma.inquiry.count({ where: { deletedAt: null } }),
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
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: { statusString: status },
        })

        logAudit({
            action: "INQUIRY_STATUS_UPDATED",
            entity: "Inquiry",
            entityId: id,
            metadata: { newStatus: status },
        })

        revalidatePath("/admin/inquiries")
        return { success: true, inquiry }
    } catch (error) {
        console.error("Failed to update inquiry status:", error)
        return { success: false, error: "Failed to update status" }
    }
}

// Soft-delete
export async function deleteInquiry(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.inquiry.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        logAudit({
            action: "INQUIRY_DELETED",
            entity: "Inquiry",
            entityId: id,
        })

        revalidatePath("/admin/inquiries")
        return { success: true }
    } catch (error) {
        console.warn("Failed to delete inquiry:", error instanceof Error ? error.message : String(error))
        return { success: false, error: "Failed to delete inquiry" }
    }
}

export async function toggleStarred(id: string) {
    const session = await verifySession()
    if (!session) return { success: false }

    try {
        const inquiry = await prisma.inquiry.findUnique({ where: { id } })
        if (!inquiry) throw new Error("Not found")

        await prisma.inquiry.update({
            where: { id },
            data: { isStarred: !inquiry.isStarred }
        })
        revalidatePath("/admin/inquiries")
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}

export async function markAsRead(id: string) {
    const session = await verifySession()
    if (!session) return { success: false }

    try {
        await prisma.inquiry.update({
            where: { id },
            data: { isRead: true }
        })
        revalidatePath("/admin/inquiries")
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}

export async function archiveInquiry(id: string) {
    const session = await verifySession()
    if (!session) return { success: false }

    try {
        await prisma.inquiry.update({
            where: { id },
            data: { isArchived: true }
        })
        logAudit({ action: "INQUIRY_ARCHIVED", entity: "Inquiry", entityId: id })
        revalidatePath("/admin/inquiries")
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}

export async function assignInquiry(id: string, userId: string | null) {
    try {
        const session = await verifySession()
        const currentUser = await prisma.user.findUnique({ where: { id: session?.user?.id } })
        const assignerName = currentUser?.name || currentUser?.email || "System"

        let assignedUserName = "Unassigned"
        if (userId) {
            const assignedUserRecord = await prisma.user.findUnique({ where: { id: userId } })
            assignedUserName = assignedUserRecord?.name || assignedUserRecord?.email || "Unknown Staff"
        }

        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: {
                assignedToId: userId,
                isRead: true // Auto-read when assigned
            }
        })

        // 1. Log as an internal Note for historical timeline
        await prisma.inquiryNote.create({
            data: {
                content: `Assigned to ${assignedUserName} by ${assignerName}`,
                inquiryId: id,
                userId: session?.user?.id || "",
                userName: "System" // System-level event note
            }
        })

        // 2. Fire Staff Notification (if assigned to a real user)
        if (userId) {
            await NotificationService.create({
                userId,
                type: "INFO",
                title: "Lead Assigned",
                message: `You have been assigned to lead: ${inquiry.name}`,
                priority: "HIGH",
                link: `/admin/inquiries?id=${id}`
            })
        }

        // 3. Log Audit
        logAudit({
            action: userId ? "INQUIRY_ASSIGNED" : "INQUIRY_UNASSIGNED",
            entity: "Inquiry",
            entityId: id,
            metadata: { assignedTo: userId }
        })

        revalidatePath("/admin/inquiries")
        return { success: true, assignedUserName } // pass back name for optimistic UI
    } catch (e) {
        console.error("Assign Inquiry Error:", e)
        return { success: false }
    }
}

export async function addInquiryNote(id: string, content: string) {
    try {
        const session = await verifySession()
        if (!session?.user) throw new Error("Unauthorized")

        const user = await prisma.user.findUnique({ where: { id: session.user.id } })
        const userName = user?.name || user?.email || "Admin"

        await prisma.inquiryNote.create({
            data: {
                content,
                inquiryId: id,
                userId: session.user.id,
                userName
            }
        })

        revalidatePath("/admin/inquiries")
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}

export async function getInquiryNotes(id: string) {
    try {
        return await prisma.inquiryNote.findMany({
            where: { inquiryId: id },
            orderBy: { createdAt: "desc" }
        })
    } catch (e) {
        return []
    }
}

export async function replyToInquiry(id: string, replyContent: string) {
    try {
        const session = await verifySession()
        if (!session?.user) throw new Error("Unauthorized")

        const inquiry = await prisma.inquiry.findUnique({ where: { id } })
        if (!inquiry) throw new Error("Inquiry not found")

        // Double-Reply Guard: If assigned to another admin, block this reply
        if (inquiry.assignedToId && inquiry.assignedToId !== session.user.id) {
            const assignee = await prisma.user.findUnique({ where: { id: inquiry.assignedToId }, select: { name: true, email: true } })
            return { success: false, error: `This inquiry is assigned to ${assignee?.name || assignee?.email || 'another admin'}. Reassign it to yourself first.` }
        }

        // Auto-assign on first reply if unassigned
        if (!inquiry.assignedToId) {
            await prisma.inquiry.update({ where: { id }, data: { assignedToId: session.user.id } })
        }

        const brandingSettings = await prisma.siteSettings.findUnique({ where: { id: "default" }, include: { EmailBranding: true } })
        const branding: import("./email-branding").EmailBrandingData = {
            logoUrl: brandingSettings?.EmailBranding?.logoUrl || null,
            primaryColor: brandingSettings?.EmailBranding?.primaryColor || "#4A5D23",
            accentColor: brandingSettings?.EmailBranding?.accentColor || "#E87A1E",
            footerText: brandingSettings?.EmailBranding?.footerText || "Edwak Nutrition",
            websiteUrl: brandingSettings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
            supportEmail: brandingSettings?.EmailBranding?.supportEmail || "info@edwaknutrition.co.ke",
            clinicLocation: brandingSettings?.address,
            contactPhone: brandingSettings?.phoneNumber,
            paymentTill: brandingSettings?.paymentTillNumber,
            paymentPaybill: brandingSettings?.paymentPaybill
        }

        // Store reply explicitly
        await prisma.inquiryReply.create({
            data: {
                content: replyContent,
                inquiryId: id,
                sentBy: session.user.id
            }
        })

        // Send Email
        const { resend, fromEmail } = await getResendClient()

        // The free email loop hack
        // Resend doesn't natively expose the top level reply_to config from sendReactEmail wrapper, 
        // so we must send this payload via the raw method if we want to add the specific reply_to header manually,
        const reactEmailRender = await import("@react-email/render")
        const htmlContent = await reactEmailRender.render(
            InquiryReplyEmail({
                clientName: inquiry.name,
                originalMessage: inquiry.message,
                replyMessage: replyContent,
                branding
            })
        )

        const emailSubject = `Re: Your inquiry to Edwak Nutrition`
        try {
            await resend.emails.send({
                from: `Edwak Nutrition <${fromEmail}>`,
                to: [inquiry.email],
                replyTo: branding.supportEmail || "info@edwaknutrition.co.ke",
                subject: emailSubject,
                html: htmlContent,
            })
            await logEmailAttempt({ recipientEmail: inquiry.email, subject: emailSubject, context: "INQUIRY_REPLY", entityId: id, success: true })
        } catch (emailErr) {
            console.error("Inquiry reply email failed:", emailErr)
            await logEmailAttempt({ recipientEmail: inquiry.email, subject: emailSubject, context: "INQUIRY_REPLY", entityId: id, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
        }

        // Update to CONTACTED
        await prisma.inquiry.update({
            where: { id },
            data: { statusString: "CONTACTED", isRead: true }
        })

        logAudit({ action: "INQUIRY_REPLIED", entity: "Inquiry", entityId: id })
        revalidatePath("/admin/inquiries")

        return { success: true }
    } catch (e) {
        console.error("Failed to reply:", e)
        return { success: false, error: e instanceof Error ? e.message : "Failure" }
    }
}
