"use server"

/**
 * Xinteck Pattern: Media Upload & Cleanup Pipeline
 * 
 * - Strict MIME type validation & size limits
 * - resource_type: "auto" for images + video via single endpoint
 * - MediaFile DB sync on every upload
 * - Soft-delete DB + Hard-delete Cloudinary with resource_type awareness
 */

import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { getCloudinary } from "@/lib/cloudinary"
import { prisma } from "@/lib/prisma"

// ═══════════════════════════════════════════════════════
// Constants & Validation
// ═══════════════════════════════════════════════════════

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB (supports video)

const ALLOWED_MIME_TYPES = new Set([
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
])

/**
 * Determine Cloudinary resource_type from MIME type.
 */
function getResourceType(mimeType: string): "image" | "video" | "raw" {
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("image/")) return "image"
    return "raw"
}

// ═══════════════════════════════════════════════════════
// Upload Pipeline
// ═══════════════════════════════════════════════════════

export async function uploadFile(formData: FormData): Promise<{
    success: boolean
    url?: string
    publicId?: string
    width?: number
    height?: number
    size?: number
    mimeType?: string
    error?: string
}> {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "daily_nutrition_uploads"
    const folderId = formData.get("folderId") as string | null

    if (!file || !(file instanceof File)) {
        return { success: false, error: "No file provided" }
    }

    // Strict MIME validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return { success: false, error: `File type "${file.type}" is not allowed. Supported: JPEG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM.` }
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.` }
    }

    try {
        const cloudinary = await getCloudinary()
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto", // Crucial: handles images AND video in single endpoint
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        // DB Sync: Create MediaFile record
        const mediaFile = await prisma.mediaFile.create({
            data: {
                publicId: result.public_id,
                url: result.secure_url,
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                folderId: folderId || undefined,
            }
        })

        logAudit({
            action: "MEDIA_UPLOADED",
            entity: "MediaFile",
            entityId: mediaFile.id,
            userId: session.user?.id,
            metadata: { filename: file.name, size: file.size, mimeType: file.type },
        })

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            size: file.size,
            mimeType: file.type,
        }
    } catch (error: any) {
        console.error("Upload failed:", error)
        return { success: false, error: error.message || "Upload failed. Check Cloudinary configuration." }
    }
}

// ═══════════════════════════════════════════════════════
// Storage Cleanup (Soft-Delete DB + Hard-Delete Cloud)
// ═══════════════════════════════════════════════════════

export async function deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    if (!publicId) return { success: false, error: "No public ID provided" }

    try {
        // Step 1: Find the MediaFile to get the mimeType for resource_type detection
        const mediaFile = await prisma.mediaFile.findUnique({
            where: { publicId }
        })

        // Step 2: Referential Integrity Check — block deletion if URL is in use
        if (mediaFile) {
            const url = mediaFile.url
            const [usedInBlog, usedInService, usedInSettings] = await Promise.all([
                prisma.blogPost.findFirst({ where: { OR: [{ content: { contains: url } }, { image: url }], deletedAt: null }, select: { title: true } }),
                prisma.service.findFirst({ where: { image: url, deletedAt: null }, select: { title: true } }),
                prisma.siteSettings.findFirst({ where: { profileImageUrl: url } }),
            ])

            const usages: string[] = []
            if (usedInBlog) usages.push(`Blog Post "${usedInBlog.title}"`)
            if (usedInService) usages.push(`Service "${usedInService.title}"`)
            if (usedInSettings) usages.push(`Site Settings (Profile Image)`)

            if (usages.length > 0) {
                return { success: false, error: `Cannot delete: this file is currently used in ${usages.join(", ")}. Remove it from those locations first.` }
            }
        }

        // Step 3: Soft-delete in DB (audit trail preservation)
        if (mediaFile) {
            await prisma.mediaFile.update({
                where: { publicId },
                data: { deletedAt: new Date() }
            })
        }

        // Step 3: Hard-delete from Cloudinary with correct resource_type
        const cloudinary = await getCloudinary()
        const resourceType = mediaFile ? getResourceType(mediaFile.mimeType) : "image"

        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        })

        logAudit({
            action: "MEDIA_DELETED",
            entity: "MediaFile",
            entityId: mediaFile?.id || publicId,
            userId: session.user?.id,
            metadata: { publicId, resourceType },
        })

        return { success: true }
    } catch (error: any) {
        console.error("Delete failed:", error)
        return { success: false, error: error.message || "Delete failed" }
    }
}

// ═══════════════════════════════════════════════════════
// Legacy Compatibility Wrappers
// ═══════════════════════════════════════════════════════

/**
 * @deprecated Use uploadFile() instead. This exists for backward compatibility.
 */
export async function uploadImage(formData: FormData) {
    return uploadFile(formData)
}

/**
 * @deprecated Use deleteFile() instead. This exists for backward compatibility.
 */
export async function deleteImage(publicId: string) {
    return deleteFile(publicId)
}

// ═══════════════════════════════════════════════════════
// Fetch Media Files
// ═══════════════════════════════════════════════════════

export async function getMediaFiles() {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const files = await prisma.mediaFile.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
        })
        return { success: true, files }
    } catch (error: any) {
        console.error("Failed to fetch media files:", error)
        return { success: false, error: "Failed to fetch media files" }
    }
}
