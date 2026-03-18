import { NewsletterService } from "@/lib/services/newsletter-service"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (!email || !token) {
        return new NextResponse("Missing email or token", { status: 400 })
    }

    try {
        const secret = process.env.ENCRYPTION_KEY || "fallback_secret_key_for_dev_only"
        const expectedToken = crypto.createHmac("sha256", secret).update(email).digest("hex")

        if (token !== expectedToken) {
            return new NextResponse("Invalid unsubscription token", { status: 403 })
        }

        // Token is valid, unsubscribe the user
        await NewsletterService.unsubscribe(email)

        // Return a simple success HTML page
        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Unsubscribed Successfully</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 40px 20px; background: #fafafa; color: #333; }
                    .card { background: white; max-width: 400px; margin: 0 auto; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    h1 { color: #4A5D23; margin-top: 0; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Unsubscribed</h1>
                    <p>You have been successfully removed from the Daily Nutrition mailing list.</p>
                    <p><strong>${email}</strong> will no longer receive these emails.</p>
                </div>
            </body>
            </html>
        `, {
            headers: { "Content-Type": "text/html" }
        })

    } catch (error) {
        console.error("Unsubscribe error:", error)
        return new NextResponse("An error occurred processing your request", { status: 500 })
    }
}
