"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type BlogPost = {
    id: string
    title: string
    slug: string
    content: string
    published: boolean
    category: string
    image: string | null
    createdAt: Date
    updatedAt: Date
}

// ... existing code ...

export async function createPost(data: { title: string; content: string; published: boolean; category?: string; image?: string | null }) {
    const slug = generateSlug(data.title)
    try {
        const post = await prisma.blogPost.create({
            data: {
                title: data.title,
                slug,
                content: data.content,
                published: data.published,
                category: data.category || "General",
                image: data.image
            },
        })
        revalidatePath("/admin/blog")
        revalidatePath("/blog")
        return { success: true, post }
    } catch (error) {
        console.error("Failed to create post:", error)
        return { success: false, error: "Failed to create post" }
    }
}

export async function updatePost(id: string, data: { title: string; content: string; published: boolean; category?: string; image?: string | null }) {
    try {
        // If title changes, we might want to update slug, but usually better to keep slug stable for SEO unless requested.
        // For simplicity, we keep slug stable.
        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                published: data.published,
                category: data.category,
                image: data.image
            },
        })
        revalidatePath("/admin/blog")
        revalidatePath("/blog")
        revalidatePath(`/blog/${post.slug}`)
        return { success: true, post }
    } catch (error) {
        console.error("Failed to update post:", error)
        return { success: false, error: "Failed to update post" }
    }
}

export async function deletePost(id: string) {
    try {
        await prisma.blogPost.delete({ where: { id } })
        revalidatePath("/admin/blog")
        revalidatePath("/blog")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete post:", error)
        return { success: false, error: "Failed to delete post" }
    }
}
