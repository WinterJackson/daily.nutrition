"use server"

import { verifySession, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCategories() {
    try {
        const categories = await prisma.blogCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        })
        return categories
    } catch (error) {
        console.error("Failed to fetch categories:", error)
        return []
    }
}

export async function createCategory(name: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

    try {
        const category = await prisma.blogCategory.create({
            data: {
                name,
                slug,
                description: `Posts about ${name}`
            }
        })
        revalidatePath("/admin/blog/categories")
        return { success: true, category }
    } catch (error) {
        console.error("Failed to create category:", error)
        return { success: false, error: "Failed to create category (Duplicate?)" }
    }
}

export async function deleteCategory(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Check if has posts
        const category = await prisma.blogCategory.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } }
        })

        if (category && category._count.posts > 0) {
            return { success: false, error: "Cannot delete category with associated posts." }
        }

        await prisma.blogCategory.delete({ where: { id } })
        revalidatePath("/admin/blog/categories")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete category:", error)
        return { success: false, error: "Failed to delete category" }
    }
}
