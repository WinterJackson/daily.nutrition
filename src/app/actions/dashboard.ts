"use server"

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export interface DashboardStats {
    inquiries: {
        total: number
        new: number
        change: number
    }
    consultations: {
        booked: number
        today: number
    }
    services: {
        active: number
        total: number
    }
    blog: {
        views: number
        total: number
    }
    revenue: {
        estimated: number
        completedBookings: number
    }
    newsletter: {
        subscribers: number
    }
    conversionRate: number
    recentActivity: ActivityItem[]
}

export interface ActivityItem {
    id: string
    type: 'inquiry' | 'review' | 'system'
    title: string
    description: string
    time: Date
}

// Xinteck Pattern: Cached dashboard stats with 5-minute revalidation
const getCachedCounts = unstable_cache(
    async () => {
        const now = new Date()
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const [
            totalInquiries,
            newInquiries,
            totalBookings,
            bookingsToday,
            activeServices,
            totalServices,
            totalPosts,
            blogViewsAgg,
            completedBookings,
            newsletterSubs
        ] = await Promise.all([
            prisma.inquiry.count({ where: { deletedAt: null } }),
            prisma.inquiry.count({ where: { statusString: "NEW", deletedAt: null } }),
            prisma.booking.count({ where: { deletedAt: null, bookingStatus: { not: "CANCELLED" } } }),
            prisma.booking.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } }),
            prisma.service.count({ where: { isVisible: true, deletedAt: null } }),
            prisma.service.count({ where: { deletedAt: null } }),
            prisma.blogPost.count({ where: { deletedAt: null } }),
            prisma.blogPost.aggregate({ _sum: { views: true }, where: { deletedAt: null } }),
            prisma.booking.findMany({
                where: { deletedAt: null, bookingStatus: "COMPLETED" },
                include: { service: { select: { priceVirtual: true } } }
            }),
            prisma.newsletterSubscriber.count({ where: { isActive: true, deletedAt: null } })
        ])

        // Calculate estimated revenue from completed bookings
        const estimatedRevenue = completedBookings.reduce((sum, b) => {
            return sum + (b.service?.priceVirtual || 0)
        }, 0)

        return {
            totalInquiries,
            newInquiries,
            totalBookings,
            bookingsToday,
            activeServices,
            totalServices,
            totalPosts,
            totalViews: blogViewsAgg._sum.views || 0,
            estimatedRevenue,
            completedBookingsCount: completedBookings.length,
            newsletterSubs
        }
    },
    ["dashboard-counts"],
    { revalidate: 300, tags: ["dashboard"] } // 5-minute cache
)

// Activity feed cached separately with 1-minute revalidation
const getCachedActivity = unstable_cache(
    async () => {
        const [recentInquiries, recentTestimonials] = await Promise.all([
            prisma.inquiry.findMany({ where: { deletedAt: null }, take: 3, orderBy: { createdAt: 'desc' } }),
            prisma.testimonial.findMany({ where: { deletedAt: null }, take: 2, orderBy: { createdAt: 'desc' } })
        ])

        return { recentInquiries, recentTestimonials }
    },
    ["dashboard-activity"],
    { revalidate: 60, tags: ["dashboard-activity"] } // 1-minute cache
)

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const counts = await getCachedCounts()
        const { recentInquiries, recentTestimonials } = await getCachedActivity()

        const activity: ActivityItem[] = [
            ...recentInquiries.map(i => ({
                id: i.id,
                type: 'inquiry' as const,
                title: "New Inquiry Received",
                description: `From ${i.name}`,
                time: new Date(i.createdAt)
            })),
            ...recentTestimonials.map(t => ({
                id: t.id,
                type: 'review' as const,
                title: "New Testimonial",
                description: `From ${t.authorName}`,
                time: new Date(t.createdAt)
            }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5)

        // Calculate conversion rate (bookings / inquiries)
        const conversionRate = counts.totalInquiries > 0
            ? Math.round((counts.totalBookings / counts.totalInquiries) * 100)
            : 0

        return {
            inquiries: {
                total: counts.totalInquiries,
                new: counts.newInquiries,
                change: counts.newInquiries
            },
            consultations: {
                booked: counts.totalBookings,
                today: counts.bookingsToday
            },
            services: {
                active: counts.activeServices,
                total: counts.totalServices
            },
            blog: {
                views: counts.totalViews,
                total: counts.totalPosts
            },
            revenue: {
                estimated: counts.estimatedRevenue,
                completedBookings: counts.completedBookingsCount
            },
            newsletter: {
                subscribers: counts.newsletterSubs
            },
            conversionRate,
            recentActivity: activity
        }
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return {
            inquiries: { total: 0, new: 0, change: 0 },
            consultations: { booked: 0, today: 0 },
            services: { active: 0, total: 0 },
            blog: { views: 0, total: 0 },
            revenue: { estimated: 0, completedBookings: 0 },
            newsletter: { subscribers: 0 },
            conversionRate: 0,
            recentActivity: []
        }
    }
}
