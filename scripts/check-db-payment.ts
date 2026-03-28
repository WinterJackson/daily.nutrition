import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" }
    })
    console.log("DB SETTINGS:", JSON.stringify({
        paymentTillNumber: settings?.paymentTillNumber,
        paymentPaybill: settings?.paymentPaybill
    }, null, 2))
}

main()
