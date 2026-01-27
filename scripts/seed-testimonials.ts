const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Seed Testimonials
    const testimonials = [
        {
            authorName: "Sarah M.",
            rating: 5,
            content: "Working with Edna transformed how I manage my diabetes. Her personalized meal plans made blood sugar control so much easier. I've never felt better!",
            status: "APPROVED",
            serviceId: "diabetes-management",
        },
        {
            authorName: "James K.",
            rating: 5,
            content: "During my treatment, Edna's nutritional guidance was invaluable. She helped me maintain my strength and manage side effects through proper nutrition.",
            status: "APPROVED",
            serviceId: "cancer-nutrition",
        },
        {
            authorName: "Mary W.",
            rating: 5,
            content: "After years of digestive issues, the FODMAP guidance I received finally gave me relief. The personalized approach made all the difference.",
            status: "APPROVED",
            serviceId: "gut-health",
        },
    ]

    for (let i = 1; i <= 15; i++) {
        const status = i % 4 === 0 ? "PENDING" : "APPROVED"
        testimonials.push({
            authorName: `Happy Patient ${i}`,
            rating: 4 + (i % 2), // 4 or 5 stars
            content: `This is a generated testimonial #${i}. The service was excellent and I saw great results within a few weeks. Highly recommended!`,
            status: status,
            serviceId: "general-counselling"
        })
    }

    for (const testimonial of testimonials) {
        await prisma.testimonial.upsert({
            where: { id: testimonial.authorName.toLowerCase().replace(/\s/g, '-') + '-testimonial' },
            update: testimonial,
            create: {
                id: testimonial.authorName.toLowerCase().replace(/\s/g, '-') + '-testimonial',
                ...testimonial,
            },
        })
        console.log(`Testimonial from ${testimonial.authorName} created/updated`)
    }

    console.log('Seed completed!')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

export { }

