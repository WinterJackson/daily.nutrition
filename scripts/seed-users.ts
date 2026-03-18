/**
 * Seed script for role-based user accounts
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-users.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const users = [
    {
        email: "superadmin@dailynutrition.co.ke",
        password: "SuperAdmin@2026!",
        name: "Super Admin",
        role: "SUPER_ADMIN",
    },
    {
        email: "admin@dailynutrition.co.ke",
        password: "Admin@2026!",
        name: "Admin User",
        role: "ADMIN",
    },
    {
        email: "support@dailynutrition.co.ke",
        password: "Support@2026!",
        name: "Support Staff",
        role: "SUPPORT",
    },
]

async function main() {
    console.log("🌱 Seeding user accounts...\n")

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 12)

        const created = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                password: hashedPassword,
                name: user.name,
                role: user.role,
            },
            create: {
                email: user.email,
                password: hashedPassword,
                name: user.name,
                role: user.role,
            },
        })

        console.log(`  ✓ ${user.role.padEnd(12)} | ${user.email} | ${user.password}`)
    }

    console.log("\n✅ All user accounts seeded successfully!")
}

main()
    .catch((e) => {
        console.error("Error seeding users:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
