"use server"

import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { blogPostSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export type BlogPost = {
    id: string
    title: string
    slug: string
    content: string
    published: boolean
    categoryId: string | null
    category: { name: string } | null
    image: string | null
    metaTitle: string | null
    metaDescription: string | null
    createdAt: Date
    updatedAt: Date
}

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function getBlogStats() {
    try {
        const [total, published, drafts] = await Promise.all([
            prisma.blogPost.count({ where: { deletedAt: null } }),
            prisma.blogPost.count({ where: { published: true, deletedAt: null } }),
            prisma.blogPost.count({ where: { published: false, deletedAt: null } })
        ])

        const categories = await prisma.blogCategory.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        })

        return {
            total,
            published,
            drafts,
            categories: categories.map(c => ({ category: c.name, count: c._count.posts }))
        }
    } catch (error) {
        console.error("Failed to fetch blog stats:", error)
        return { total: 0, published: 0, drafts: 0, categories: [] }
    }
}

export async function getPosts(publishedOnly = false, page = 1, pageSize = 10, query?: string, category?: string, status?: string) {
    try {
        const where: any = { deletedAt: null }

        if (publishedOnly) {
            where.published = true
        } else if (status) {
            if (status === 'Published') where.published = true
            if (status === 'Draft') where.published = false
        }

        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
            ]
        }

        if (category && category !== "All") {
            where.category = { name: category }
        }

        const [posts, totalCount] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { category: true }
            }),
            prisma.blogPost.count({ where }),
        ])
        return { posts, totalCount }
    } catch (error) {
        console.error("Failed to fetch posts:", error)
        return { posts: [], totalCount: 0 }
    }
}

export async function getRelatedPosts(categoryName: string, currentPostId: string) {
    try {
        const posts = await prisma.blogPost.findMany({
            where: {
                published: true,
                deletedAt: null,
                category: { name: categoryName },
                NOT: { id: currentPostId }
            },
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { category: true }
        })
        return posts
    } catch (error) {
        console.error("Failed to fetch related posts:", error)
        return []
    }
}

export async function getPostBySlug(slug: string) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug },
            include: { category: true }
        })
        return post
    } catch (error) {
        console.error("Failed to fetch post:", error)
        return null
    }
}

export async function getPost(id: string) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { id },
            include: { category: true }
        })
        return post
    } catch (error) {
        console.error("Failed to fetch post:", error)
        return null
    }
}

export async function createPost(data: { title: string; content: string; published: boolean; categoryId?: string; image?: string | null; metaTitle?: string; metaDescription?: string; status?: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED" }) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    // Rate limit blog creation per user
    const rateCheck = await checkRateLimit(session.user.id, "blog_write", RATE_LIMITS.apiStandard)
    if (!rateCheck.success) {
        return { success: false, error: "Rate limit exceeded. Please wait before creating another post." }
    }

    // Zod validation
    // Mathematical Collision Defense: Dynamically generate unique slugs
    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    let counter = 1

    while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
    }

    const validated = blogPostSchema.partial().safeParse({ ...data, slug })
    if (!validated.success) {
        return { success: false, error: validated.error.issues.map(e => e.message).join(", ") }
    }

    try {
        const post = await prisma.blogPost.create({
            data: {
                title: data.title,
                slug,
                content: data.content,
                published: data.published,
                status: data.status || (data.published ? "PUBLISHED" : "DRAFT"),
                categoryId: data.categoryId,
                image: data.image,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                updatedAt: new Date()
            },
        })

        logAudit({
            action: "BLOG_POST_CREATED",
            entity: "BlogPost",
            entityId: post.id,
            userId: (session?.user?.id),
            metadata: { title: post.title, slug: post.slug },
        })

        revalidatePath("/admin/blog")
        revalidatePath("/blog")
        return { success: true, post }
    } catch (error) {
        console.error("Failed to create post:", error)
        return { success: false, error: "Failed to create post" }
    }
}

export async function updatePost(id: string, data: { title: string; content: string; published: boolean; categoryId?: string; image?: string | null; metaTitle?: string; metaDescription?: string; version?: number; status?: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED" }) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Optimistic locking: check version if provided
        if (data.version !== undefined) {
            const current = await prisma.blogPost.findUnique({ where: { id }, select: { version: true } })
            if (current && current.version !== data.version) {
                return { success: false, error: "This post was modified by another user. Please refresh and try again." }
            }
        }

        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                published: data.published,
                status: data.status || (data.published ? "PUBLISHED" : "DRAFT"),
                categoryId: data.categoryId,
                image: data.image,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                version: { increment: 1 },
            },
        })

        logAudit({
            action: "BLOG_POST_UPDATED",
            entity: "BlogPost",
            entityId: post.id,
            userId: (session?.user?.id),
            metadata: { title: post.title },
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

// Soft-delete: sets deletedAt instead of hard deleting
export async function deletePost(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.blogPost.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        logAudit({
            action: "BLOG_POST_DELETED",
            entity: "BlogPost",
            entityId: id,
            userId: (session?.user?.id),
        })

        revalidatePath("/admin/blog")
        revalidatePath("/blog")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete post:", error)
        return { success: false, error: "Failed to delete post" }
    }
}

// Soft-delete bulk
export async function deletePosts(ids: string[]) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.blogPost.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() }
        })

        logAudit({
            action: "BLOG_POSTS_BULK_DELETED",
            entity: "BlogPost",
            entityId: ids.join(","),
            userId: (session?.user?.id),
            metadata: { count: ids.length },
        })

        revalidatePath("/admin/blog")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete posts:", error)
        return { success: false, error: "Failed to delete posts" }
    }
}
