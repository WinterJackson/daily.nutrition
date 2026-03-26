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
        serviceName: string;
        date: string;
        time: string;
        bookingUrl: string;
    };
    passwordChanged?: {
        date: string;
        ipAddress?: string;
    };
    bookingCancelled?: {
        clientName: string;
        serviceName: string;
        referenceCode: string;
    };
    bookingRescheduled?: {
        clientName: string;
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
            // Default to TRUE if no preferences record exists yet
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
            const adminEmail = settings.contactEmail; // Send to admin

            // 4. Branding
            const branding: EmailBrandingData = {
                logoUrl: settings.EmailBranding?.logoUrl || null,
                primaryColor: settings.EmailBranding?.primaryColor || "#556B2F",
                accentColor: settings.EmailBranding?.accentColor || "#E87A1E",
                footerText: settings.EmailBranding?.footerText || "Edwak Nutrition",
                websiteUrl: settings.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
                supportEmail: settings.EmailBranding?.supportEmail || "support@edwaknutrition.co.ke"
            };

            // 5. Select Template & Send
            let subject = "";
            let reactElement: React.ReactElement | null = null;
            let htmlContent = "";

            switch (type) {
                case "NEW_BOOKING":
                    if (payload.newBooking) {
                        subject = `New Booking: ${payload.newBooking.clientName}`;
                        reactElement = AdminNewBookingEmail({
                            branding,
                            ...payload.newBooking
                        });
                    }
                    break;
                case "PASSWORD_CHANGED":
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
                        htmlContent = `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h2 style="color: #d9534f;">A booking has been cancelled</h2>
                                <p><strong>Client:</strong> ${payload.bookingCancelled.clientName}</p>
                                <p><strong>Service:</strong> ${payload.bookingCancelled.serviceName}</p>
                                <p><strong>Reference:</strong> ${payload.bookingCancelled.referenceCode}</p>
                            </div>
                        `;
                    }
                    break;
                case "BOOKING_RESCHEDULED":
                    if (payload.bookingRescheduled) {
                        subject = `Booking Rescheduled: ${payload.bookingRescheduled.clientName}`;
                        htmlContent = `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h2 style="color: #5bc0de;">A booking was rescheduled</h2>
                                <p><strong>Client:</strong> ${payload.bookingRescheduled.clientName}</p>
                                <p><strong>Service:</strong> ${payload.bookingRescheduled.serviceName}</p>
                                <p><strong>Reference:</strong> ${payload.bookingRescheduled.referenceCode}</p>
                                <p><strong>New Time:</strong> ${payload.bookingRescheduled.newDate} at ${payload.bookingRescheduled.newTime}</p>
                            </div>
                        `;
                    }
                    break;
            }

            if (reactElement || htmlContent) {
                const emailConfig: any = {
                    from: `Edwak Nutrition System <${fromEmail}>`,
                    to: adminEmail,
                    subject
                };

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
