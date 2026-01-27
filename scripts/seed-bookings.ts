/**
 * Seed script for test bookings
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-bookings.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const testBookings = [
    {
        clientName: "Sarah Johnson",
        clientEmail: "sarah.j@example.com",
        clientPhone: "+254 712 345 678",
        serviceName: "Diabetes Management",
        sessionType: "virtual",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 60,
        status: "CONFIRMED",
        notes: "New patient, referred by Dr. Smith"
    },
    {
        clientName: "Michael Ochieng",
        clientEmail: "michael.o@example.com",
        clientPhone: "+254 723 456 789",
        serviceName: "Weight Management",
        sessionType: "in-person",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        duration: 45,
        status: "CONFIRMED",
        notes: null
    },
    {
        clientName: "Jane Wanjiku",
        clientEmail: "jane.w@example.com",
        clientPhone: "+254 734 567 890",
        serviceName: "Cancer Support Nutrition",
        sessionType: "virtual",
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        duration: 60,
        status: "COMPLETED",
        notes: "Follow-up scheduled for next month"
    },
    {
        clientName: "Peter Kamau",
        clientEmail: "peter.k@example.com",
        serviceName: "Free Discovery Call",
        sessionType: "virtual",
        scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        duration: 30,
        status: "NO_SHOW",
        notes: "Did not attend, tried calling - no answer"
    },
    {
        clientName: "Grace Akinyi",
        clientEmail: "grace.a@example.com",
        clientPhone: "+254 756 789 012",
        serviceName: "Gut Health Program",
        sessionType: "in-person",
        scheduledAt: new Date(), // Today
        duration: 60,
        status: "CONFIRMED",
        notes: "First consultation"
    }
]

async function main() {
    console.log("🌱 Seeding test bookings...")

    for (const booking of testBookings) {
        await prisma.booking.create({
            data: booking
        })
        console.log(`  ✓ Created booking for ${booking.clientName}`)
    }

    console.log(`\n✅ Seeded ${testBookings.length} test bookings`)
}

main()
    .catch((e) => {
        console.error("Error seeding bookings:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
