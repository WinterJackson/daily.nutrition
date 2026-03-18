const { PrismaClient } = require('@prisma/client')
require('dotenv').config() // Load .env
const prisma = new PrismaClient()

async function main() {
  const categories = [
    "Education",
    "Nutrition Tips", 
    "Research", 
    "Recipe", 
    "Announcement",
    "General"
  ]

  console.log('Start seeding categories...')

  for (const name of categories) {
    const slug = name.toLowerCase().replace(/ /g, '-')
    await prisma.blogCategory.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug,
        description: `All posts related to ${name}`
      }
    })
    console.log(`Upserted category: ${name}`)
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
