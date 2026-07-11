import { prisma } from "@/lib/prisma"
import { MetadataRoute } from "next"
import { unstable_cache } from "next/cache"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://edwaknutrition.co.ke"

const getCachedServiceSlugs = unstable_cache(
    async () => {
        return prisma.service.findMany({
            where: { isVisible: true, deletedAt: null },
            select: { slug: true, updatedAt: true },
        })
    },
    ["sitemap-services"],
    { tags: ["sitemap-services"], revalidate: 3600 }
)

const getCachedBlogSlugs = unstable_cache(
    async () => {
        return prisma.blogPost.findMany({
            where: { published: true, deletedAt: null },
            select: { slug: true, updatedAt: true },
        })
    },
    ["sitemap-blog"],
    { tags: ["sitemap-blog"], revalidate: 3600 }
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE_URL}/booking`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ]

    // Dynamic service pages
    try {
        const services = await getCachedServiceSlugs()

        const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
            url: `${BASE_URL}/services/${s.slug}`,
            lastModified: s.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }))

        // Dynamic blog posts
        const posts = await getCachedBlogSlugs()

        const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
            url: `${BASE_URL}/blog/${p.slug}`,
            lastModified: p.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }))

        return [...staticRoutes, ...serviceRoutes, ...blogRoutes]
    } catch {
        return staticRoutes
    }
}
