import { INTERNAL_getSecret } from "@/lib/ai/secrets"
import { prisma } from "@/lib/prisma"
import { render } from "@react-email/render"
import { Resend } from "resend"

/**
 * Dynamically fetches the Resend API key from the database and decrypts it.
 * This ensures the app doesn't need to be redeployed if the key changes.
 */
export async function getResendClient() {
    const apiKey = await INTERNAL_getSecret("RESEND_API_KEY")

    if (!apiKey) {
        throw new Error("Resend API key is not configured in settings or environment.")
    }

    // We still fetch settings for the fromEmail branding
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { ResendConfig: true }
    })

    const fromEmail = settings?.ResendConfig?.fromEmail || "no-reply@edwaknutrition.co.ke"

    return {
        resend: new Resend(apiKey),
        fromEmail,
    }
}

/**
 * Generic helper to send React emails using the dynamic client.
 */
export async function sendReactEmail(to: string[], subject: string, reactComponent: React.ReactElement) {
    try {
        const { resend, fromEmail } = await getResendClient()
        const htmlContent = await render(reactComponent)

        const result = await resend.emails.send({
            from: `Edwak Nutrition <${fromEmail}>`,
            to,
            subject,
            html: htmlContent,
        })

        return { success: true, data: result }
    } catch (error) {
        console.error("Failed to send React Email:", error)
        return { success: false, error: "Failed to dispatch email." }
    }
}
