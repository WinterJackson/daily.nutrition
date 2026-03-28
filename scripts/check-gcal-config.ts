import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { GoogleCalendarConfig: true }
    })

    console.log("Calendar ID:", settings?.googleCalendarId || "NOT SET")
    console.log("Google Config exists:", !!settings?.GoogleCalendarConfig)
    if (settings?.GoogleCalendarConfig) {
        console.log("  encryptedClientEmail:", settings.GoogleCalendarConfig.encryptedClientEmail ? `SET (${settings.GoogleCalendarConfig.encryptedClientEmail.length} chars)` : "EMPTY")
        console.log("  encryptedPrivateKey:", settings.GoogleCalendarConfig.encryptedPrivateKey ? `SET (${settings.GoogleCalendarConfig.encryptedPrivateKey.length} chars)` : "EMPTY")
        console.log("  eventDuration:", settings.GoogleCalendarConfig.eventDuration)
        console.log("  bufferTime:", settings.GoogleCalendarConfig.bufferTime)
    }
}

main()
