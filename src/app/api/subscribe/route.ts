import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const subscribeSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = subscribeSchema.parse(body)

        // Rate limit by IP address
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
        const { contactLimiter } = await import("@/lib/rate-limit")
        const rateCheck = await contactLimiter(`newsletter_${ip}`)

        if (!rateCheck.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait before trying again.' },
                { status: 429 }
            )
        }

        // Upsert logic: if email exists, flip isActive back to true. Otherwise, create new.
        await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: {
                isActive: true,
                unsubscribedAt: null,
                deletedAt: null,
            },
            create: {
                email,
                isActive: true,
                source: 'Footer Form',
            },
        })

        return NextResponse.json({ success: true, message: "Subscribed successfully" })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 })
        }
        console.error('Newsletter subscribe error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
