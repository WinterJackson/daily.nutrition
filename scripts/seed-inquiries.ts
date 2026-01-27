const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const inquiries = [
    {
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        message: "Hi, I was recently diagnosed with Type 2 diabetes and I'm looking for a comprehensive meal plan to help manage my blood sugar levels. Do you offer virtual consultations?",
        status: "NEW",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
        name: "Michael Brown",
        email: "m.brown88@example.com",
        message: "I've been struggling with severe bloating and suspect it might be IBS. I saw your Gut Health service and wanted to know if you accept insurance.",
        status: "CONTACTED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
        name: "Emily Chen",
        email: "emily.chen@example.com",
        message: "Looking for a nutritionist to help with weight loss after pregnancy. I'm breastfeeding so I need a safe plan.",
        status: "NEW",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    {
        name: "David Wilson",
        email: "david.wilson@content.com",
        message: "Do you work with athletes? I'm training for a marathon and need a fueling strategy.",
        status: "CLOSED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
    },
    {
        name: "Jessica Alba",
        email: "jess.a@example.com",
        message: "Just wanted to thank you for the blog post on Hydration. It was very helpful!",
        status: "NEW",
        createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
    },
    {
        name: "Robert Taylor",
        email: "r.taylor@example.com",
        message: "Inquiry about corporate wellness packages for my company.",
        status: "CONTACTED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
    },
    {
        name: "Lisa Anderson",
        email: "lisa.anderson@example.com",
        message: "I am interested in the Oncology Nutrition Support for my father.",
        status: "NEW",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    },
    {
        name: "Kevin White",
        email: "k.white@example.com",
        message: "Can I book a discovery call for next Tuesday?",
        status: "CLOSED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 week ago
    }
]

const statuses = ["NEW", "CONTACTED", "CLOSED"]
for (let i = 1; i <= 25; i++) {
    const status = statuses[i % 3] as "NEW" | "CONTACTED" | "CLOSED"
    inquiries.push({
        name: `Mock Client ${i}`,
        email: `client${i}@example.com`,
        message: `This is a generated inquiry message number ${i}. I am interested in your services and would like to know more about pricing and availability.`,
        status: status,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * i)
    })
}

async function main() {
    console.log('Start seeding inquiries...')

    // Clear existing inquiries to avoid duplicates if re-running (optional, or just append)
    // await prisma.inquiry.deleteMany() 

    for (const inquiry of inquiries) {
        await prisma.inquiry.create({
            data: inquiry
        })
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

export { }

