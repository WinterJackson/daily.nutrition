import { BookingExpiredEmail } from "@/components/emails/BookingExpiredEmail";
import { logAudit } from "@/lib/audit";
import { logEmailAttempt } from "@/lib/email-logger";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const now = new Date();

        // Find all pending bookings whose payment deadline has passed
        const expiredBookings = await prisma.booking.findMany({
            where: {
                bookingStatus: "PENDING",
                paymentDeadline: { lt: now },
            },
        });

        if (expiredBookings.length === 0) {
            return NextResponse.json({ success: true, message: "No expired bookings found", count: 0 });
        }

        const { INTERNAL_getSecret } = await import("@/lib/ai/secrets")
        const apiKey = await INTERNAL_getSecret("RESEND_API_KEY")

        let emailConfig = null;
        if (apiKey) {
            const settings: any = await prisma.siteSettings.findUnique({
                where: { id: "default" },
                include: { ResendConfig: true, EmailBranding: true }
            });
            emailConfig = {
                resend: new Resend(apiKey),
                fromEmail: settings?.ResendConfig?.fromEmail || "no-reply@edwaknutrition.co.ke",
                branding: {
                    logoUrl: settings?.EmailBranding?.logoUrl || null,
                    primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
                    accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
                    footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition, Nairobi, Kenya",
                    websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
                    supportEmail: settings?.EmailBranding?.supportEmail || "info@edwaknutrition.co.ke",
                    clinicLocation: settings?.address,
                    contactPhone: settings?.phoneNumber,
                    paymentTill: settings?.paymentTillNumber,
                    paymentPaybill: settings?.paymentPaybill,
                    paymentAccountNumber: settings?.paymentAccountNumber,
                    paymentAccountName: settings?.paymentAccountName
                }
            };
        }
        const websiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edwaknutrition.co.ke";

        for (const booking of expiredBookings) {
            // 1. Update status to EXPIRED
            await prisma.booking.update({
                where: { id: booking.id },
                data: { bookingStatus: "EXPIRED" },
            });

            // 2. Delete Google Calendar event to free up the slot
            if (booking.googleEventId) {
                try {
                    await deleteCalendarEvent(booking.googleEventId);
                } catch (gcErr) {
                    console.error(`Failed to delete Google Calendar event for expired booking ${booking.id}:`, gcErr);
                }
            }

            // 3. Log Audit
            logAudit({
                action: "BOOKING_EXPIRED",
                entity: "Booking",
                entityId: booking.id,
                metadata: { referenceCode: booking.referenceCode, clientName: booking.clientName },
            });

            // 4. Send Expiration Email
            if (emailConfig) {
                const clientTimezone = booking.clientTimezone || "Africa/Nairobi";
                const scheduledDate = new Date(booking.scheduledAt);

                const formattedDate = scheduledDate.toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric", year: "numeric",
                    timeZone: clientTimezone,
                });
                const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
                    hour: "numeric", minute: "2-digit", timeZone: clientTimezone,
                });

                const emailSubject = `Booking Hold Expired: ${booking.serviceName}`;
                try {
                    await emailConfig.resend.emails.send({
                        from: `Edwak Nutrition <${emailConfig.fromEmail}>`,
                        to: booking.clientEmail,
                        subject: emailSubject,
                        react: BookingExpiredEmail({
                            clientName: booking.clientName,
                            serviceName: booking.serviceName,
                            date: formattedDate,
                            time: `${formattedTime} (${clientTimezone})`,
                            branding: emailConfig.branding,
                            bookingUrl: `${websiteUrl}/booking`,
                        }),
                    });
                    await logEmailAttempt({
                        recipientEmail: booking.clientEmail,
                        subject: emailSubject,
                        context: "BOOKING_EXPIRED",
                        entityId: booking.referenceCode || booking.id,
                        success: true,
                    });
                } catch (emailErr) {
                    console.error("Expiration email failed:", emailErr);
                    await logEmailAttempt({
                        recipientEmail: booking.clientEmail,
                        subject: emailSubject,
                        context: "BOOKING_EXPIRED",
                        entityId: booking.referenceCode || booking.id,
                        success: false,
                        errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown",
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Expired ${expiredBookings.length} bookings`,
            count: expiredBookings.length,
        });
    } catch (error) {
        console.error("Error running expire-bookings cron:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
