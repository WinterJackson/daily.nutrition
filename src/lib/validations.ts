import { z } from "zod"

export const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
)

export const slugRegex = new RegExp(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const bookingSchema = z.object({
    clientName: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
    clientEmail: z.string().email("Invalid email address").toLowerCase().trim(),
    clientPhone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
    serviceId: z.string().optional(),
    serviceName: z.string().min(2).max(100).trim(),
    sessionType: z.enum(["virtual", "in-person"]),
    type: z.enum(["VIRTUAL", "IN_PERSON"]).default("VIRTUAL"),
    date: z.date().optional(),
    time: z.string().optional(),
    scheduledAt: z.date().or(z.string().transform(str => new Date(str))),
    duration: z.number().int().positive().default(60),
    notes: z.string().max(1000).optional(),
    clientTimezone: z.string().default("Africa/Nairobi"),
})

export const blogPostSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(150).trim(),
    slug: z.string().regex(slugRegex, "Slug must contain only lowercase letters, numbers, and hyphens"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    published: z.boolean().default(false),
    status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    categoryId: z.string().optional().nullable(),
    image: z.string().url("Must be a valid URL").optional().nullable(),
    metaTitle: z.string().max(60).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
})

export const serviceSchema = z.object({
    title: z.string().min(3).max(100).trim(),
    slug: z.string().regex(slugRegex, "Invalid slug format"),
    shortDescription: z.string().min(10).max(200).trim(),
    fullDescription: z.string().optional().nullable(),
    features: z.array(z.string().trim()).default([]),
    targetAudience: z.string().optional().nullable(),
    icon: z.string().default("Activity"),
    color: z.string().default("text-brand-green"),
    bgColor: z.string().default("bg-brand-green/10"),
    priceVirtual: z.number().int().nonnegative().optional().nullable(),
    priceInPerson: z.number().int().nonnegative().optional().nullable(),
    isVisible: z.boolean().default(true),
    status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
    displayOrder: z.number().int().default(0),
    image: z.string().url().optional().nullable(),
})

export const inquirySchema = z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    message: z.string().min(10).max(2000).trim(),
    preferredDate: z.date().optional().nullable(),
})

export const testimonialSchema = z.object({
    authorName: z.string().min(2).max(100).trim(),
    rating: z.number().int().min(1).max(5),
    content: z.string().min(10).max(1000).trim(),
    serviceId: z.string().optional().nullable(),
    contentStatus: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]).default("IN_REVIEW"),
    statusString: z.string().default("PENDING"),
})

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

export const settingsSchema = z.object({
    businessName: z.string().min(2).max(100),
    contactEmail: z.string().email(),
    phoneNumber: z.string(),
    address: z.string(),
    pageTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.string(),
    paymentTillNumber: z.string().optional(),
    paymentPaybill: z.string().optional(),
    themePreference: z.enum(["light", "dark", "system"]).default("light"),
    googleCalendarId: z.string().optional(),
    instagramUrl: z.string().optional(),
    linkedinUrl: z.string().optional(),
    twitterUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
})
