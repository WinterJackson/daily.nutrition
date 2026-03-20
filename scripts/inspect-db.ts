
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Inspecting Database Settings...')

    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { GoogleCalendarConfig: true }
    })

    if (!settings) {
        console.log('❌ No default settings found!')
        return
    }

    console.log('✅ Settings Found:')
    console.log(`- Google Calendar ID: ${settings.googleCalendarId}`)

    if (settings.GoogleCalendarConfig) {
        console.log('\n📅 Google Calendar Config:')
        console.log(`- Duration: ${settings.GoogleCalendarConfig.eventDuration} mins`)
        console.log(`- Buffer: ${settings.GoogleCalendarConfig.bufferTime} mins`)
        console.log(`- Has Client Email: ${!!settings.GoogleCalendarConfig.encryptedClientEmail}`)
        console.log(`- Has Private Key: ${!!settings.GoogleCalendarConfig.encryptedPrivateKey}`)

        console.log('\n🔓 Availability JSON:')
        console.log(JSON.stringify(settings.GoogleCalendarConfig.availability, null, 2))
    } else {
        console.log('\n❌ No Google Calendar Config relation found.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
