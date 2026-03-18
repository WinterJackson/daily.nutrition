import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasourceUrl: process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma_v2: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma_v2 ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v2 = prisma
