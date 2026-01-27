const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const posts = [
    {
        title: "Understanding Macronutrients: A Beginner's Guide",
        slug: "understanding-macronutrients",
        content: "# Understanding Macronutrients\n\nProteins, fats, and carbohydrates are the building blocks of nutrition...",
        published: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) // 10 days ago
    },
    {
        title: "5 Tips for Managing Diabetes During the Holidays",
        slug: "managing-diabetes-holidays",
        content: "# Managing Diabetes\n\nThe holidays can be tough. Here are 5 tips to stay on track...",
        published: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25) // 25 days ago
    },
    {
        title: "The Gut-Brain Connection: What You Need to Know",
        slug: "gut-brain-connection",
        content: "# The Gut-Brain Connection\n\nRecent science shows a strong link between your gut health and mental well-being...",
        published: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
        title: "Hydration Logic: More Than Just Water",
        slug: "hydration-logic",
        content: "# Hydration Logic\n\nElectrolytes play a key role in true hydration relative to simple water intake...",
        published: false, // Draft
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
    }
]

// Generate more posts
for (let i = 1; i <= 15; i++) {
    const isPublished = i % 3 !== 0 // 2/3 published
    posts.push({
        title: `Healthy Habit #${i}: Nutrition Tips for Better Living`,
        slug: `healthy-habit-${i}`,
        content: `# Healthy Habit #${i}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n## Key Takeaways\n- Eat whole foods\n- Stay hydrated\n- Sleep well`,
        published: isPublished,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * i * 2)
    })
}

async function main() {
    console.log('Start seeding blog posts...')

    for (const post of posts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: {},
            create: post
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

