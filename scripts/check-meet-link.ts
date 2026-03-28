import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    // Check the most recent bookings for encryptedMeetLink status
    const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
            referenceCode: true,
            clientName: true,
            serviceName: true,
            sessionType: true,
            bookingStatus: true,
            encryptedMeetLink: true,
            googleEventId: true,
            createdAt: true
        }
    })

    for (const b of bookings) {
        console.log(`\n--- ${b.referenceCode} (${b.clientName}) ---`)
        console.log(`  Service: ${b.serviceName}`)
        console.log(`  Session: ${b.sessionType}`)
        console.log(`  Status: ${b.bookingStatus}`)
        console.log(`  Google Event ID: ${b.googleEventId || "NONE"}`)
        console.log(`  Encrypted Meet Link: ${b.encryptedMeetLink ? `YES (${b.encryptedMeetLink.length} chars)` : "EMPTY/NULL"}`)
        console.log(`  Created: ${b.createdAt}`)
    }
}

main()
