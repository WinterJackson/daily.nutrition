"use server"

import { BookingCancellationEmail } from "@/components/emails/BookingCancellation";
import { BookingRescheduledEmail } from "@/components/emails/BookingRescheduled";
import { logAudit } from "@/lib/audit";
import { logEmailAttempt } from "@/lib/email-logger";
import { decrypt } from "@/lib/encryption";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { NotificationManager } from "@/lib/notifications/manager";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";


export async function lookupBooking(referenceCode: string, email: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { referenceCode },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.clientEmail.toLowerCase() !== email.toLowerCase()) {
            return { success: false, error: "Email does not match booking records" };
        }

        return { success: true, booking };
    } catch (error) {
        console.error("Lookup Booking Error:", error);
        return { success: false, error: "Failed to lookup booking" };
    }
}

export async function cancelBooking(referenceCode: string) {
    try {
        const booking = await prisma.booking.update({
            where: { referenceCode },
            data: { bookingStatus: "CANCELLED" }
        });

        // 1b. Delete from Google Calendar if linked
        if (booking.googleEventId) {
            try {
                await deleteCalendarEvent(booking.googleEventId);
            } catch (gcErr) {
                console.error("Failed to delete Google Calendar event during cancellation:", gcErr);
            }
        }

        // 2. Fetch Settings for Email
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            include: { ResendConfig: true, EmailBranding: true }
        })

        // 3. Send Email
        if (settings?.ResendConfig?.encryptedApiKey) {
            let apiKey = ""
            try {
                apiKey = decrypt(settings.ResendConfig.encryptedApiKey) || ""
            } catch (e) {
                console.error("Failed to decrypt API key")
            }

            if (apiKey) {
                const resend = new Resend(apiKey)
                const fromEmail = settings.ResendConfig.fromEmail || "onboarding@resend.dev"

                const branding = {
                    logoUrl: settings?.EmailBranding?.logoUrl || null,
                    primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
                    accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
                    footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition, Nairobi, Kenya",
                    websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
                    supportEmail: settings?.EmailBranding?.supportEmail || "support@edwaknutrition.co.ke"
                }

                // Format time for email
                const scheduledDate = new Date(booking.scheduledAt)
                const clientTimezone = booking.clientTimezone || "Africa/Nairobi"

                const formattedDate = scheduledDate.toLocaleDateString("en-US", {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: clientTimezone
                })

                const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: clientTimezone
                })

                const emailSubject = `Booking Cancelled: ${booking.serviceName}`
                try {
                    await resend.emails.send({
                        from: `Edwak Nutrition <${fromEmail}>`,
                        to: booking.clientEmail,
                        subject: emailSubject,
                        react: BookingCancellationEmail({
                            clientName: booking.clientName,
                            serviceName: booking.serviceName,
                            date: formattedDate,
                            time: `${formattedTime} (${clientTimezone})`,
                            branding: branding,
                            bookingUrl: settings?.EmailBranding?.websiteUrl ? `${settings.EmailBranding.websiteUrl}/booking` : "https://edwaknutrition.co.ke/booking"
                        })
                    })
                    await logEmailAttempt({ recipientEmail: booking.clientEmail, subject: emailSubject, context: "BOOKING_CANCELLATION", entityId: referenceCode, success: true })
                } catch (emailErr) {
                    console.error("Cancellation email failed:", emailErr)
                    await logEmailAttempt({ recipientEmail: booking.clientEmail, subject: emailSubject, context: "BOOKING_CANCELLATION", entityId: referenceCode, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
                }
            }
        }

        logAudit({
            action: "BOOKING_CANCELLED",
            entity: "Booking",
            entityId: booking.id,
            metadata: { referenceCode, clientName: booking.clientName },
        })

        await NotificationManager.sendAdminNotification("BOOKING_CANCELLED", {
            bookingCancelled: {
                clientName: booking.clientName,
                serviceName: booking.serviceName,
                referenceCode: referenceCode
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Cancel Booking Error:", error);
        return { success: false, error: "Failed to cancel booking" };
    }
}

export async function getBookingDetails(referenceCode: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { referenceCode },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        return { success: true, booking };
    } catch (error) {
        console.error("Get Booking Error:", error);
        return { success: false, error: "Failed to fetch booking" };
    }
}

// Reschedule a booking: update date/time, modify Google Calendar event, send email
export async function rescheduleBooking(referenceCode: string, newDateStr: string, newTime: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { referenceCode },
        });

        if (!booking) return { success: false, error: "Booking not found" };

        // Check 24h notice
        const now = new Date();
        const appointmentTime = new Date(booking.scheduledAt);
        const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) return { success: false, error: "Cannot reschedule with less than 24 hours notice" };

        // Double-Booking Guard: Verify slot is still open natively inside Google Calendar for business hours
        const { getAvailableSlots } = await import('@/lib/google-calendar');
        const slots = await getAvailableSlots(newDateStr);
        if (!slots.includes(newTime)) {
            return { success: false, error: "This time slot is no longer available. Please choose another." };
        }

        // Parse exact absolute UTC timezone string, ignoring server drift completely
        const newScheduledAt = new Date(newTime);
        if (newScheduledAt <= now) return { success: false, error: "New time must be in the future" };

        // Update the booking in DB
        const updatedBooking = await prisma.booking.update({
            where: { referenceCode },
            data: {
                scheduledAt: newScheduledAt,
            }
        });

        // Update in Google Calendar if linked
        if (updatedBooking.googleEventId) {
            try {
                const { updateCalendarEvent } = await import('@/lib/google-calendar');
                await updateCalendarEvent(
                    updatedBooking.googleEventId,
                    newTime,
                    Math.round(updatedBooking.duration) // Ensure integer
                );
            } catch (gcErr) {
                console.error("Failed to update Google Calendar event during reschedule:", gcErr);
            }
        }

        // Send rescheduled confirmation email
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            include: { ResendConfig: true, EmailBranding: true }
        });

        if (settings?.ResendConfig?.encryptedApiKey) {
            let apiKey = "";
            try {
                apiKey = decrypt(settings.ResendConfig.encryptedApiKey) || "";
            } catch (e) {
                console.error("Failed to decrypt API key");
            }

            if (apiKey) {
                const resend = new Resend(apiKey);
                const fromEmail = settings.ResendConfig.fromEmail || "onboarding@resend.dev";
                const clientTimezone = updatedBooking.clientTimezone || "Africa/Nairobi";

                // Format old time for email
                const oldScheduledAt = new Date(booking.scheduledAt);
                const oldFormattedDate = oldScheduledAt.toLocaleDateString("en-US", {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                    timeZone: clientTimezone
                });
                const oldFormattedTime = oldScheduledAt.toLocaleTimeString("en-US", {
                    hour: 'numeric', minute: '2-digit',
                    timeZone: clientTimezone
                });

                const formattedDate = newScheduledAt.toLocaleDateString("en-US", {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                    timeZone: clientTimezone
                });
                const formattedTime = newScheduledAt.toLocaleTimeString("en-US", {
                    hour: 'numeric', minute: '2-digit',
                    timeZone: clientTimezone
                });

                const branding = {
                    logoUrl: settings?.EmailBranding?.logoUrl || null,
                    primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
                    accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
                    footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition, Nairobi, Kenya",
                    websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
                    supportEmail: settings?.EmailBranding?.supportEmail || "support@edwaknutrition.co.ke"
                };

                const emailSubject = `Booking Rescheduled: ${updatedBooking.serviceName} (#${referenceCode})`;
                try {
                    await resend.emails.send({
                        from: `Edwak Nutrition <${fromEmail}>`,
                        to: updatedBooking.clientEmail,
                        subject: emailSubject,
                        react: BookingRescheduledEmail({
                            clientName: updatedBooking.clientName,
                            serviceName: updatedBooking.serviceName,
                            oldDate: oldFormattedDate,
                            oldTime: `${oldFormattedTime} (${clientTimezone})`,
                            newDate: formattedDate,
                            newTime: `${formattedTime} (${clientTimezone})`,
                            referenceCode: referenceCode,
                            manageUrl: `${branding.websiteUrl}/booking/manage/${referenceCode}`,
                            branding: branding
                        })
                    });
                    await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "BOOKING_RESCHEDULED", entityId: referenceCode, success: true });
                } catch (emailErr) {
                    console.error("Reschedule email failed:", emailErr);
                    await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "BOOKING_RESCHEDULED", entityId: referenceCode, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" });
                }
            }
        }

        logAudit({
            action: "BOOKING_RESCHEDULED",
            entity: "Booking",
            entityId: updatedBooking.id,
            metadata: { referenceCode, newScheduledAt: newScheduledAt.toISOString() },
        });

        await NotificationManager.sendAdminNotification("BOOKING_RESCHEDULED", {
            bookingRescheduled: {
                clientName: updatedBooking.clientName,
                serviceName: updatedBooking.serviceName,
                referenceCode: referenceCode,
                newDate: newDateStr,
                newTime: newTime
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Reschedule Booking Error:", error);
        return { success: false, error: "Failed to reschedule booking" };
    }
}

export async function checkCanReschedule(referenceCode: string) {
    const booking = await prisma.booking.findUnique({
        where: { referenceCode },
    });

    if (!booking) return { allowed: false, reason: "Not found" };

    // Check 24h notice
    const now = new Date();
    const appointmentTime = new Date(booking.scheduledAt);
    const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) return { allowed: false, reason: "Less than 24 hours notice" };

    return { allowed: true };
}
