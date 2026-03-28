import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

// Inline decrypt (mirrors src/lib/encryption.ts)
function decrypt(text: string): string {
    const key = process.env.ENCRYPTION_KEY
    if (!key) throw new Error("ENCRYPTION_KEY not set")
    const [ivHex, encrypted] = text.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key, "hex"), iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}

async function main() {
    // Load .env
    const dotenv = await import("dotenv")
    dotenv.config()

    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { GoogleCalendarConfig: true }
    })

    if (!settings?.GoogleCalendarConfig?.encryptedClientEmail ||
        !settings?.GoogleCalendarConfig?.encryptedPrivateKey) {
        console.log("ERROR: No encrypted credentials found")
        return
    }

    try {
        const clientEmail = decrypt(settings.GoogleCalendarConfig.encryptedClientEmail)
        const privateKey = decrypt(settings.GoogleCalendarConfig.encryptedPrivateKey)
        console.log("✅ Decrypted client email:", clientEmail)
        console.log("✅ Private key starts with:", privateKey.substring(0, 30) + "...")
        console.log("✅ Calendar ID:", settings.googleCalendarId)

        // Now try to authenticate
        const { JWT } = await import("google-auth-library")
        const { google } = await import("googleapis")

        const client = new JWT({
            email: clientEmail,
            key: privateKey.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"],
        })

        console.log("\n--- Testing Google Calendar API Connection ---")
        const calendar = google.calendar({ version: "v3", auth: client })

        // Try a simple list operation first
        const calList = await calendar.events.list({
            calendarId: settings.googleCalendarId,
            maxResults: 1,
            timeMin: new Date().toISOString()
        })
        console.log("✅ Calendar API connected! Found", calList.data.items?.length || 0, "upcoming events")

        // Now try creating a TEST event with conferenceData
        const testEvent = await calendar.events.insert({
            calendarId: settings.googleCalendarId,
            requestBody: {
                summary: "TEST - Delete Me",
                start: { dateTime: new Date(Date.now() + 86400000).toISOString(), timeZone: "Africa/Nairobi" },
                end: { dateTime: new Date(Date.now() + 86400000 + 1800000).toISOString(), timeZone: "Africa/Nairobi" },
                conferenceData: {
                    createRequest: {
                        requestId: Math.random().toString(36).substring(7),
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
            },
            conferenceDataVersion: 1,
        })

        console.log("\n✅ TEST event created!")
        console.log("  Event ID:", testEvent.data.id)
        console.log("  hangoutLink:", testEvent.data.hangoutLink || "NOT RETURNED")
        console.log("  htmlLink:", testEvent.data.htmlLink)
        console.log("  conferenceData:", JSON.stringify(testEvent.data.conferenceData, null, 2))

        // Clean up test event
        if (testEvent.data.id) {
            await calendar.events.delete({
                calendarId: settings.googleCalendarId,
                eventId: testEvent.data.id
            })
            console.log("\n🧹 Test event cleaned up")
        }

    } catch (err: any) {
        console.error("\n❌ ERROR:", err.message)
        if (err.response?.data) {
            console.error("  API Response:", JSON.stringify(err.response.data, null, 2))
        }
        if (err.code) {
            console.error("  Error Code:", err.code)
        }
    }
}

main()
