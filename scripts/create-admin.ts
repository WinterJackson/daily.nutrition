import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'edwaknutritionco@gmail.com'
    const password = 'edwaKnutritioN1.' // Securely provided by client

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        // 1. Seed Admin User
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN'
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Edwak Admin',
                role: 'ADMIN'
            }
        })
        console.log(`✅ Admin user created/updated: ${user.email}`)

        // 2. Seed Default Application Settings (CRITICAL FOR BOOT)
        await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: {}, // Don't overwrite if existing
            create: {
                id: "default",
                businessName: "Edwak Nutrition",
                contactEmail: "edwaknutritionco@gmail.com",
                phoneNumber: "+254 700 000 000",
                address: "Nairobi, Kenya",
                pageTitle: "Edwak Nutrition | Consultations",
                themePreference: "light",
            }
        })
        console.log(`✅ Default Site Settings seeded`)
        console.log(`Admin user created/updated: ${user.email}`)
        console.log(`Password: ${password}`)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
