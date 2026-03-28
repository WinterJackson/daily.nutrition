import { AdminUpcomingReminderEmail } from "@/components/emails/AdminUpcomingReminder"
import { UpcomingReminderEmail } from "@/components/emails/UpcomingReminder"
import { INTERNAL_getSecret } from "@/lib/ai/secrets"
import { decrypt } from "@/lib/encryption"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Resend } from "resend"

// Vercel Cron Secret Verification
function isValidCron(request: Request) {
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
    if (!isValidCron(request)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log("Running Reminder Cron Job...")

        // 1. Fetch Settings & Branding
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            include: { ResendConfig: true, EmailBranding: true }
        })

        if (!settings) {
            console.error("No site settings found")
            return NextResponse.json({ success: false, error: "No settings" })
        }

        // Read API key from SecretConfig (where it's actually stored)
        const apiKey = await INTERNAL_getSecret("RESEND_API_KEY")
        if (!apiKey) {
            console.error("No Resend API Key found in SecretConfig or ENV")
            return NextResponse.json({ success: false, error: "No API Key" })
        }

        const resend = new Resend(apiKey)
        const fromEmail = settings.ResendConfig?.fromEmail || "no-reply@edwaknutrition.co.ke"

        const branding = {
            logoUrl: settings?.EmailBranding?.logoUrl || null,
            primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
            accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
            footerText: settings?.EmailBranding?.footerText || `${settings?.businessName || "Edwak Nutrition"}`,
            websiteUrl: settings?.EmailBranding?.websiteUrl || process.env.NEXT_PUBLIC_APP_URL || "https://edwakplatform.com",
            supportEmail: settings?.EmailBranding?.supportEmail || settings?.contactEmail || "info@edwaknutritionco.com"
        }

        const now = new Date()

        // Define Windows
        // 6 hours reminder: scheduledAt is between now+5.5h and now+6.5h
        // Or cleaner: scheduledAt > now AND scheduledAt < now + 7h AND reminder6hSent = false
        // Let's broaden the window to ensure we catch it if cron runs hourly.
        // 6h Window: Appointments happening in 5-7 hours from now?
        // If cron runs every hour, we just need to find future appointments where (scheduledAt - now) <= 6h AND not sent.

        // 6 Hour Reminders
        const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000)
        // We look for appointments coming up soon (e.g. within next 7 hours) that haven't had 6h reminder.
        // But we shouldn't send 6h reminder if it's already 1h before?
        // Let's say: ScheduledAt is between 2 hours from now and 7 hours from now.
        const bookings6h = await prisma.booking.findMany({
            where: {
                bookingStatus: "CONFIRMED",
                reminder6hSent: false,
                scheduledAt: {
                    gt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // More than 2 hours away
                    lte: sixHoursFromNow // Less than or equal to 6 hours away
                }
            }
        })

        // 1 Hour Reminders
        const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000)
        // Window: Between now and 1.5 hours from now
        const bookings1h = await prisma.booking.findMany({
            where: {
                bookingStatus: "CONFIRMED",
                reminder1hSent: false,
                scheduledAt: {
                    gt: now,
                    lte: new Date(now.getTime() + 1.5 * 60 * 60 * 1000)
                }
            }
        })

        // 30 Min Admin Reminders
        const bookings30mAdmin = await prisma.booking.findMany({
            where: {
                bookingStatus: "CONFIRMED",
                adminReminder30mSent: false,
                scheduledAt: {
                    gt: now,
                    lte: new Date(now.getTime() + 35 * 60 * 1000) // Within next 35 mins
                }
            }
        })

        // 15 Min Admin Reminders
        const bookings15mAdmin = await prisma.booking.findMany({
            where: {
                bookingStatus: "CONFIRMED",
                adminReminder15mSent: false,
                scheduledAt: {
                    gt: now,
                    lte: new Date(now.getTime() + 20 * 60 * 1000) // Within next 20 mins
                }
            }
        })

        console.log(`Found ${bookings6h.length} bookings for 6h reminder`)
        console.log(`Found ${bookings1h.length} bookings for 1h reminder`)

        // Send 6h Reminders
        for (const booking of bookings6h) {
            const dateObj = new Date(booking.scheduledAt)
            const clientTimezone = booking.clientTimezone || "Africa/Nairobi"

            const formattedTime = dateObj.toLocaleTimeString('en-US', {
                timeZone: clientTimezone,
                hour: 'numeric',
                minute: '2-digit'
            });
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                timeZone: clientTimezone,
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            await resend.emails.send({
                from: `Edwak Nutrition <${fromEmail}>`,
                to: booking.clientEmail,
                subject: `Reminder: Appointment in 6 Hours`,
                react: UpcomingReminderEmail({
                    clientName: booking.clientName,
                    serviceName: booking.serviceName,
                    date: formattedDate,
                    time: `${formattedTime} (${clientTimezone})`,
                    meetLink: (booking.encryptedMeetLink && decrypt(booking.encryptedMeetLink)) || "",
                    hoursBefore: 6,
                    referenceCode: booking.referenceCode || "",
                    sessionType: (booking.sessionType as "virtual" | "in-person") || "virtual",
                    branding
                })
            })

            await prisma.booking.update({
                where: { id: booking.id },
                data: { reminder6hSent: true }
            })
        }

        // Send 1h Reminders
        for (const booking of bookings1h) {
            const dateObj = new Date(booking.scheduledAt)
            const clientTimezone = booking.clientTimezone || "Africa/Nairobi"

            const formattedTime = dateObj.toLocaleTimeString('en-US', {
                timeZone: clientTimezone,
                hour: 'numeric',
                minute: '2-digit'
            });
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                timeZone: clientTimezone,
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            await resend.emails.send({
                from: `Edwak Nutrition <${fromEmail}>`,
                to: booking.clientEmail,
                subject: `Reminder: Appointment in 1 Hour`,
                react: UpcomingReminderEmail({
                    clientName: booking.clientName,
                    serviceName: booking.serviceName,
                    date: formattedDate,
                    time: `${formattedTime} (${clientTimezone})`,
                    meetLink: (booking.encryptedMeetLink && decrypt(booking.encryptedMeetLink)) || "",
                    hoursBefore: 1,
                    referenceCode: booking.referenceCode || "",
                    sessionType: (booking.sessionType as "virtual" | "in-person") || "virtual",
                    branding
                })
            })

            await prisma.booking.update({
                where: { id: booking.id },
                data: { reminder1hSent: true }
            })
        }

        // Send 30m Admin Reminders
        for (const booking of bookings30mAdmin) {
            const dateObj = new Date(booking.scheduledAt)
            const clientTimezone = booking.clientTimezone || "Africa/Nairobi"

            const formattedTime = dateObj.toLocaleTimeString('en-US', { timeZone: clientTimezone, hour: 'numeric', minute: '2-digit' })
            const formattedDate = dateObj.toLocaleDateString('en-US', { timeZone: clientTimezone, weekday: 'long', month: 'long', day: 'numeric' })

            await resend.emails.send({
                from: `Edwak Nutrition <${fromEmail}>`,
                to: settings.contactEmail || fromEmail, // Send to Admin
                subject: `🚨 Admin Reminder: Meeting in 30 Mins (${booking.clientName})`,
                react: AdminUpcomingReminderEmail({
                    clientName: booking.clientName,
                    serviceName: booking.serviceName,
                    date: formattedDate,
                    time: `${formattedTime} (${clientTimezone})`,
                    meetLink: (booking.encryptedMeetLink && decrypt(booking.encryptedMeetLink)) || "",
                    timeUntil: "30 Minutes",
                    referenceCode: booking.referenceCode || "",
                    sessionType: (booking.sessionType as "virtual" | "in-person") || "virtual",
                    branding
                })
            })

            await prisma.booking.update({
                where: { id: booking.id },
                data: { adminReminder30mSent: true }
            })
        }

        // Send 15m Admin Reminders
        for (const booking of bookings15mAdmin) {
            const dateObj = new Date(booking.scheduledAt)
            const clientTimezone = booking.clientTimezone || "Africa/Nairobi"

            const formattedTime = dateObj.toLocaleTimeString('en-US', { timeZone: clientTimezone, hour: 'numeric', minute: '2-digit' })
            const formattedDate = dateObj.toLocaleDateString('en-US', { timeZone: clientTimezone, weekday: 'long', month: 'long', day: 'numeric' })

            await resend.emails.send({
                from: `Edwak Nutrition <${fromEmail}>`,
                to: settings.contactEmail || fromEmail, // Send to Admin
                subject: `🚨 Starting Soon: Meeting in 15 Mins (${booking.clientName})`,
                react: AdminUpcomingReminderEmail({
                    clientName: booking.clientName,
                    serviceName: booking.serviceName,
                    date: formattedDate,
                    time: `${formattedTime} (${clientTimezone})`,
                    meetLink: (booking.encryptedMeetLink && decrypt(booking.encryptedMeetLink)) || "",
                    timeUntil: "15 Minutes",
                    referenceCode: booking.referenceCode || "",
                    sessionType: (booking.sessionType as "virtual" | "in-person") || "virtual",
                    branding
                })
            })

            await prisma.booking.update({
                where: { id: booking.id },
                data: { adminReminder15mSent: true }
            })
        }

        return NextResponse.json({ success: true, processed: bookings6h.length + bookings1h.length + bookings30mAdmin.length + bookings15mAdmin.length })

    } catch (error) {
        console.error("Cron Error:", error)
        return NextResponse.json({ success: false, error: "Cron Failed" }, { status: 500 })
    }
}
