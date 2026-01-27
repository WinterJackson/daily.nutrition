"use server"

import { prisma } from "@/lib/prisma"

export interface DashboardStats {
    inquiries: {
        total: number
        new: number
        change: number // percentage
    }
    consultations: {
        booked: number // We'll mock this or base it on "CLOSED" inquiries for now as a proxy
        today: number
    }
    services: {
        active: number
        total: number
    }
    blog: {
        views: number // Mocked for now
        total: number
    }
    recentActivity: ActivityItem[]
}

export interface ActivityItem {
    id: string
    type: 'inquiry' | 'review' | 'system'
    title: string
    description: string
    time: Date
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    // Fetch counts in parallel
    const [
        totalInquiries,
        newInquiries,
        pastInquiries,
        convertedInquiries, // Treat CLOSED as booked/converted
        activeServices,
        totalServices,
        totalPosts,
        recentInquiries,
        recentTestimonials
    ] = await Promise.all([
        prisma.inquiry.count(),
        prisma.inquiry.count({ where: { status: "NEW" } }),
        prisma.inquiry.count({ where: { createdAt: { lt: oneWeekAgo } } }),
        prisma.inquiry.count({ where: { status: "CLOSED" } }),
        prisma.service.count({ where: { isVisible: true } }),
        prisma.service.count(),
        prisma.blogPost.count(),
        prisma.inquiry.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
        prisma.testimonial.findMany({ take: 2, orderBy: { createdAt: 'desc' } })
    ])

    // Calculate trends
    const inquiriesChange = pastInquiries > 0
        ? Math.round(((totalInquiries - pastInquiries) / pastInquiries) * 100)
        : 100

    // Merge activity
    const activity: ActivityItem[] = [
        ...recentInquiries.map(i => ({
            id: i.id,
            type: 'inquiry' as const,
            title: "New Inquiry Recieved",
            description: `From ${i.name}`,
            time: i.createdAt
        })),
        ...recentTestimonials.map(t => ({
            id: t.id,
            type: 'review' as const,
            title: "New Testimonial",
            description: `From ${t.authorName}`,
            time: t.createdAt
        }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5)

    return {
        inquiries: {
            total: totalInquiries,
            new: newInquiries,
            change: inquiriesChange
        },
        consultations: {
            booked: convertedInquiries, // Real data based on CLOSED status
            today: 0 // We don't track schedule dates yet, so 0 is accurate
        },
        services: {
            active: activeServices,
            total: totalServices
        },
        blog: {
            views: 0, // Usage analytics not implemented yet
            total: totalPosts
        },
        recentActivity: activity
    }
}
