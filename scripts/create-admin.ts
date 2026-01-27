import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@dailynutrition.com'
    const password = 'admin-password-123' // Replace with a secure password or prompt via env

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN'
            },
            create: {
                email,
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN'
            }
        })
        console.log(`Admin user created/updated: ${user.email}`)
        console.log(`Password: ${password}`)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
