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

        // 3. Seed at least one Service so the frontend Navbar doesn't crash or look empty
        await prisma.service.upsert({
            where: { slug: "introductory-consultation" },
            update: {},
            create: {
                slug: "introductory-consultation",
                title: "Introductory Consultation",
                shortDescription: "A preliminary discussion to understand your nutritional goals.",
                fullDescription: "During this session, we will assess your current lifestyle, dietary habits, and long-term health objectives.",
                features: ["30-minute virtual call", "Goal assessment", "Basic action plan"],
                priceVirtual: 50,
                status: "PUBLISHED",
                isVisible: true,
                displayOrder: 1,
                icon: "Activity",
                color: "text-brand-green",
                bgColor: "bg-brand-green/10"
            }
        })
        console.log(`✅ Fallback 'Introductory Consultation' Service seeded`)
        console.log(`Admin user created/updated: ${user.email}`)
        console.log(`Password: ${password}`)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
