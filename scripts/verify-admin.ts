import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@dailynutrition.com'
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
        console.log('User found:', user.email)
        console.log('Role:', user.role)
        console.log('Password hash present:', !!user.password)

        // Verify the password manually
        const isValid = await bcrypt.compare('admin-password-123', user.password)
        console.log('Is "admin-password-123" valid?', isValid)
    } else {
        console.log('User NOT found')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
