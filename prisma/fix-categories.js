const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Checking for posts without categories...')
  
  // 1. Get the 'General' category
  let generalCategory = await prisma.blogCategory.findUnique({
    where: { name: 'General' }
  })

  // Fallback if seeding failed or wasn't run
  if (!generalCategory) {
    console.log("'General' category not found. Creating it...")
    generalCategory = await prisma.blogCategory.create({
      data: {
        name: 'General',
        slug: 'general',
        description: 'Default category for general posts'
      }
    })
  }

  // 2. Count posts without category
  const count = await prisma.blogPost.count({
    where: { categoryId: null }
  })

  console.log(`Found ${count} posts without a category.`)

  if (count > 0) {
    // 3. Update them
    const result = await prisma.blogPost.updateMany({
      where: { categoryId: null },
      data: {
        categoryId: generalCategory.id
      }
    })
    console.log(`Updated ${result.count} posts to 'General' category.`)
  } else {
    console.log('All posts are already categorized.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
