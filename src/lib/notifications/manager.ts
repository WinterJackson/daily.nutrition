import { AdminBookingCancelledEmail } from "@/components/emails/AdminBookingCancelled";
import { AdminBookingRescheduledEmail } from "@/components/emails/AdminBookingRescheduled";
import { AdminNewBookingEmail } from "@/components/emails/AdminNewBooking";
import { AdminPasswordChangedEmail } from "@/components/emails/AdminPasswordChanged";
import { EmailBrandingData } from "@/components/emails/BrandedEmailLayout";
import { INTERNAL_getSecret } from "@/lib/ai/secrets";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export type AdminNotificationType = "NEW_BOOKING" | "PASSWORD_CHANGED" | "BOOKING_CANCELLED" | "BOOKING_RESCHEDULED";

interface NotificationPayload {
    newBooking?: {
        clientName: string;
        clientEmail: string;
        clientPhone?: string;
        serviceName: string;
        date: string;
        time: string;
        referenceCode?: string;
        sessionType?: "virtual" | "in-person";
        bookingUrl: string;
    };
    passwordChanged?: {
        date: string;
        ipAddress?: string;
    };
    bookingCancelled?: {
        clientName: string;
        clientEmail?: string;
        serviceName: string;
        referenceCode: string;
    };
    bookingRescheduled?: {
        clientName: string;
        clientEmail?: string;
        serviceName: string;
        referenceCode: string;
        newDate: string;
        newTime: string;
    };
}

export const NotificationManager = {
    sendAdminNotification: async (type: AdminNotificationType, payload: NotificationPayload) => {
        try {
            // 1. Fetch Configuration
            const settings = await prisma.siteSettings.findUnique({
                where: { id: "default" },
                include: {
                    ResendConfig: true,
                    EmailBranding: true,
                    NotificationPreferences: true
                }
            });

            if (!settings) {
                console.warn("NotificationManager: No site settings found");
                return { success: false, error: "No site settings configured" };
            }

            // 2. Check Preferences
            const prefs = settings.NotificationPreferences;
            const shouldSendMap = {
                "NEW_BOOKING": prefs?.emailOnNewBooking ?? true,
                "PASSWORD_CHANGED": true, // Always send security alerts
                "BOOKING_CANCELLED": prefs?.emailOnCancellation ?? true,
                "BOOKING_RESCHEDULED": prefs?.emailOnReschedule ?? true,
            };

            if (!shouldSendMap[type]) {
                return { success: true, skipped: true };
            }

            // 3. Prepare Resend — read API key from SecretConfig (where it's stored)
            const apiKey = await INTERNAL_getSecret("RESEND_API_KEY");
            if (!apiKey) {
                console.warn("NotificationManager: No Resend API Key in SecretConfig or ENV");
                return { success: false, error: "No email provider configured" };
            }

            const resend = new Resend(apiKey);
            const fromEmail = settings.ResendConfig?.fromEmail || "no-reply@edwaknutrition.co.ke";
            const adminEmail = settings.contactEmail;

            // 4. Branding
            const branding: EmailBrandingData = {
                logoUrl: settings.EmailBranding?.logoUrl || null,
                primaryColor: settings.EmailBranding?.primaryColor || "#556B2F",
                accentColor: settings.EmailBranding?.accentColor || "#E87A1E",
                footerText: settings.EmailBranding?.footerText || "Edwak Nutrition",
                websiteUrl: settings.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
                supportEmail: settings.EmailBranding?.supportEmail || "info@edwaknutrition.co.ke"
            };

            // 5. Select Template & Determine Reply-To
            //
            // Reply-To Strategy:
            //   Booking-related (NEW, CANCELLED, RESCHEDULED) → client's email
            //     → Admin clicks Reply in Gmail → TO automatically fills with the client's email
            //   System alerts (PASSWORD_CHANGED) → NO replyTo header
            //     → Gmail falls back to from: no-reply@edwaknutrition.co.ke (prevents accidental replies)
            //
            let subject = "";
            let reactElement: React.ReactElement | null = null;
            let htmlContent = "";
            let replyToAddress: string | undefined = undefined;

            switch (type) {
                case "NEW_BOOKING":
                    if (payload.newBooking) {
                        subject = `New Booking: ${payload.newBooking.clientName}`;
                        replyToAddress = payload.newBooking.clientEmail;
                        // Ensure bookingUrl is absolute (prepend websiteUrl if relative)
                        const fullBookingUrl = payload.newBooking.bookingUrl.startsWith('http')
                            ? payload.newBooking.bookingUrl
                            : `${branding.websiteUrl}${payload.newBooking.bookingUrl}`;
                        reactElement = AdminNewBookingEmail({
                            branding,
                            ...payload.newBooking,
                            bookingUrl: fullBookingUrl
                        });
                    }
                    break;
                case "PASSWORD_CHANGED":
                    // System alert — no replyTo (stays undefined → falls back to no-reply@)
                    if (payload.passwordChanged) {
                        subject = "Security Alert: Password Changed";
                        reactElement = AdminPasswordChangedEmail({
                            branding,
                            ...payload.passwordChanged
                        });
                    }
                    break;
                case "BOOKING_CANCELLED":
                    if (payload.bookingCancelled) {
                        subject = `Booking Cancelled: ${payload.bookingCancelled.clientName}`;
                        replyToAddress = payload.bookingCancelled.clientEmail;
                        reactElement = AdminBookingCancelledEmail({
                            branding,
                            ...payload.bookingCancelled,
                            dashboardUrl: `${branding.websiteUrl}/admin/bookings`
                        });
                    }
                    break;
                case "BOOKING_RESCHEDULED":
                    if (payload.bookingRescheduled) {
                        subject = `Booking Rescheduled: ${payload.bookingRescheduled.clientName}`;
                        replyToAddress = payload.bookingRescheduled.clientEmail;
                        reactElement = AdminBookingRescheduledEmail({
                            branding,
                            ...payload.bookingRescheduled,
                            dashboardUrl: `${branding.websiteUrl}/admin/bookings`
                        });
                    }
                    break;
            }

            if (reactElement || htmlContent) {
                const emailConfig: any = {
                    from: `Edwak Nutrition System <${fromEmail}>`,
                    to: adminEmail,
                    subject
                };

                // Only set replyTo for booking-related emails (so admin can reply directly to client)
                // System alerts intentionally have NO replyTo — Gmail falls back to from: no-reply@
                if (replyToAddress) {
                    emailConfig.replyTo = replyToAddress;
                }

                if (reactElement) {
                    emailConfig.react = reactElement;
                } else if (htmlContent) {
                    emailConfig.html = htmlContent;
                }

                await resend.emails.send(emailConfig);
                return { success: true };
            }

            return { success: false, error: "Invalid payload or type" };

        } catch (error) {
            console.error("NotificationManager Error:", error);
            // Don't throw, just log. Notifications shouldn't break main flow.
            return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
};
