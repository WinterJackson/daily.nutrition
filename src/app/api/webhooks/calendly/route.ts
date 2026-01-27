import { upsertBookingFromCalendly } from "@/app/actions/bookings"
import { NextRequest, NextResponse } from "next/server"

// Calendly Webhook Event Types
interface CalendlyEvent {
    event: "invitee.created" | "invitee.canceled"
    payload: {
        uri: string
        event: {
            name: string
            start_time: string
            end_time: string
            location?: {
                type: string
            }
        }
        invitee: {
            name: string
            email: string
            questions_and_answers?: Array<{
                question: string
                answer: string
            }>
        }
        tracking?: {
            utm_campaign?: string
        }
    }
}

/**
 * Calendly Webhook Handler
 * Receives booking events from Calendly and syncs them to the local database.
 * 
 * Setup Instructions:
 * 1. Deploy the app to a public URL
 * 2. Go to Calendly > Integrations > Webhooks
 * 3. Create a webhook pointing to: https://yourdomain.com/api/webhooks/calendly
 * 4. Set CALENDLY_WEBHOOK_SECRET in .env
 * 5. Subscribe to: invitee.created, invitee.canceled
 */
export async function POST(request: NextRequest) {
    try {
        // Optional: Verify webhook signature (for production)
        const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET
        if (webhookSecret) {
            const signature = request.headers.get("Calendly-Webhook-Signature")
            // In production, verify the signature using crypto
            // For now, we just check if it exists
            if (!signature) {
                console.warn("Calendly webhook: Missing signature header")
                // Continue processing for dev, reject in production
            }
        }

        const body: CalendlyEvent = await request.json()

        console.log(`Calendly webhook received: ${body.event}`)

        const { payload } = body
        const calendlyId = payload.uri // Unique identifier from Calendly

        // Calculate duration from start/end times
        const startTime = new Date(payload.event.start_time)
        const endTime = new Date(payload.event.end_time)
        const durationMs = endTime.getTime() - startTime.getTime()
        const duration = Math.round(durationMs / (1000 * 60)) // Convert to minutes

        // Determine session type from location
        const sessionType = payload.event.location?.type === "inbound_call" ? "in-person" : "virtual"

        // Extract service name from event name or first question answer
        const serviceName = payload.event.name || "Consultation"

        if (body.event === "invitee.created") {
            // New booking created
            await upsertBookingFromCalendly(calendlyId, {
                clientName: payload.invitee.name,
                clientEmail: payload.invitee.email,
                serviceName,
                sessionType: sessionType as "virtual" | "in-person",
                scheduledAt: startTime,
                duration,
                status: "CONFIRMED"
            })

            console.log(`Booking synced: ${payload.invitee.name} - ${payload.event.name}`)
        }
        else if (body.event === "invitee.canceled") {
            // Booking cancelled
            await upsertBookingFromCalendly(calendlyId, {
                clientName: payload.invitee.name,
                clientEmail: payload.invitee.email,
                serviceName,
                sessionType: sessionType as "virtual" | "in-person",
                scheduledAt: startTime,
                duration,
                status: "CANCELLED"
            })

            console.log(`Booking cancelled: ${payload.invitee.name}`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Calendly webhook error:", error)
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        )
    }
}

// Handle GET request for webhook verification (some services require this)
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Calendly webhook endpoint is active"
    })
}
