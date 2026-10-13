// Seed script: Adds Cigna and CIC Insurance as the initial accepted insurance providers.
// Run with: npx ts-node --project tsconfig.json scripts/seed-insurance.ts
// Or: npx tsx scripts/seed-insurance.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🛡️  Seeding insurance providers...")

    const providers = [
        {
            name: "Cigna",
            description:
                "Cigna covers outpatient nutrition consultations at our partner clinic. Benefits vary by policy — contact your employer HR team or Cigna directly to confirm your outpatient nutrition benefit.",
            contactInfo: "Visit cigna.com or contact your HR benefits team to verify your coverage.",
            websiteUrl: "https://www.cigna.com",
            displayOrder: 1,
            isActive: true,
        },
        {
            name: "CIC Insurance",
            description:
                "CIC medical insurance plans include outpatient nutrition consultations at our partner clinic. Covers are subject to your specific plan limits.",
            contactInfo: "Call 0703 099 120 or visit cicinsurancegroup.com to verify your outpatient cover.",
            websiteUrl: "https://www.cicinsurancegroup.com",
            displayOrder: 2,
            isActive: true,
        },
    ]

    for (const p of providers) {
        const existing = await prisma.insuranceProvider.findFirst({ where: { name: p.name } })
        if (existing) {
            console.log(`  ⏭  Skipping "${p.name}" — already exists.`)
            continue
        }
        await prisma.insuranceProvider.create({ data: p })
        console.log(`  ✅ Created "${p.name}"`)
    }

    console.log("✨ Insurance providers seeded successfully.")
}

main()
    .catch(e => {
        console.error("❌ Seed failed:", e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
