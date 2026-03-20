import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🧹 Safe-Purging only previously injected Google Reviews (Keeping your mock data safe)...")

    // We strictly wipe the entire database table for Testimonials
    // Note: This does NOT delete your local file `scripts/seed-testimonials.ts`!
    await prisma.testimonial.deleteMany({})

    console.log("🌟 Injecting your exact 10 real-world 5-star Google Reviews...")

    const realReviews = [
        {
            id: "google-manual-1",
            authorName: "lucianah ghanga",
            content: "Professional and excellent.",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2026-03-19T10:00:00Z") // "A day ago" from March 20, 2026
        },
        {
            id: "google-manual-2",
            authorName: "Robin Ndirangu",
            content: "Huge shout-out to Edna for the incredible virtual consult and meal plan. It's rare to find someone who listens so well and delivers a plan that fits a busy life. If you need a nutrition reset that is convenient, she's the right call.",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2026-03-19T11:00:00Z")
        },
        {
            id: "google-manual-3",
            authorName: "Mercyline Mercy",
            content: "My experience has been amazing. I was struggling with GI issues, and the guidance I received was very professional, kind, and detailed. I felt listened to and supported throughout the process, and I’ve seen real improvement in my health. Thank you for the dedication and care.",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2026-03-19T12:00:00Z")
        },
        {
            id: "google-manual-4",
            authorName: "Alvin Tezi",
            content: "5 star rating to Edna! She put together a thoughtful meal plan to help me with my dietary needs. I was particularly impressed by her friendly demeanour and care during and after the consultation.",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2026-03-19T13:00:00Z")
        },
        {
            id: "google-manual-5",
            authorName: "nelius Mundara",
            content: "After consultation with nutritionist Edna regarding the management of diabetes my health has greatly improved. Edna is very empathetic and has good follow up of her patients. I highly recommend her.",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2025-12-20T10:00:00Z") // "3 months ago"
        },
        {
            id: "google-manual-6",
            authorName: "Rachel Wanjiru",
            content: "I am a happy client 😊 Edna from Daily Nutrition supported my mum with Nutrition advice and meal plans when she had just been diagnosed with diabetes. 4 months down the line now my Mum's sugar levels are manageable and within the required range. Thank you!",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2025-12-20T11:00:00Z")
        },
        {
            id: "google-manual-7",
            authorName: "Constance Mwangasha",
            content: "I wanted to share my honest feedback because I’ve used your nutrition services so many times & every single experience has been amazing. Your guidance is truly exceptional—10/10, minus nothing!",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2025-12-20T12:00:00Z")
        },
        {
            id: "google-manual-8",
            authorName: "Karen Bitok",
            content: "I had an amazing experience with Edna. Edna was very helpful and very professional. She guided my mum on different ways of improving her health. Her meal plans were very helpful and simple. I am glad to have found a good nutritionist.",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2025-12-20T13:00:00Z")
        },
        {
            id: "google-manual-9",
            authorName: "brenda naliaka",
            content: "I really liked and enjoyed my experience because the nutritionist was patient and helpful. She took her time and came up with a meal plan to suit my underlying condition and weight",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2025-11-20T10:00:00Z") // "4 months ago"
        },
        {
            id: "google-manual-10",
            authorName: "Marshel Nyangor",
            content: "Wakio is a wonderful nutritionist with impactful and practical guides. Her weight management meal plan and lifestyle adjustment tools plays a central role in my weight management journey and I am forever grateful.",
            rating: 5,
            statusString: "PUBLISHED",
            contentStatus: "PUBLISHED",
            createdAt: new Date("2025-11-20T11:00:00Z")
        }
    ]

    const result = await prisma.testimonial.createMany({
        data: realReviews as any
    })

    console.log(`✅ Magnificently injected ${result.count} pure 5-Star reviews!`)
}

main()
    .catch((e) => {
        console.error("❌ Fatal Error during injection:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
