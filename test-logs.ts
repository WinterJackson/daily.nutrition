import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  console.log("--- RECENT EMAIL LOGS ---")
  console.log(JSON.stringify(logs, null, 2))
  
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" }})
  console.log("\n--- SITE SETTINGS BUSINESS NAME ---")
  console.log(settings?.businessName)
}

main().catch(console.error).finally(() => prisma.$disconnect())
