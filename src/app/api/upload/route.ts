/**
 * File Upload API Route — Hardened
 *
 * Server Actions have a hardcoded 1MB body size limit in Next.js 15+.
 * This API route bypasses that limit by using the standard Next.js API route
 * pattern, which respects the standard body size configuration.
 *
 * Security Features:
 * - Session-based authentication (JWT + DB dual-check)
 * - Rate limiting per IP (10 uploads per minute)
 * - Strict MIME type validation
 * - File size enforcement (50MB max)
 * - Path traversal prevention on folder parameter
 * - Security headers on response
 * - Audit logging for all uploads
 */

import { logAudit } from "@/lib/audit";
import { verifySession } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

// ═══════════════════════════════════════════════════════
// Constants & Validation
// ═══════════════════════════════════════════════════════

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const UPLOAD_RATE_LIMIT = { limit: 10, windowMs: 60 * 1000 }; // 10 uploads per minute per IP

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
]);

// Folder name sanitization — prevent path traversal
const SAFE_FOLDER_REGEX = /^[a-zA-Z0-9_\-/]+$/;

function getResourceType(mimeType: string): "image" | "video" | "raw" {
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("image/")) return "image";
    return "raw";
}

interface UploadOptions {
    folder: string;
    resource_type: "image" | "video" | "raw";
    format?: string;
    quality?: string;
}

/**
 * Extract client IP from request headers (supports proxies/CDNs).
 */
function getClientIp(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}

// ═══════════════════════════════════════════════════════
// POST Handler — Secure File Upload
// ═══════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
    // ── Step 1: Auth check (JWT + DB dual-check) ──
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Step 2: Rate limiting per IP ──
    const ip = getClientIp(request);
    const rateLimitResult = await checkRateLimit(
        `upload:${ip}`,
        "file_upload",
        UPLOAD_RATE_LIMIT,
    );

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: "Too many upload attempts. Please wait a moment.",
                retryAfter: rateLimitResult.reset,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": Math.ceil(
                        (rateLimitResult.reset.getTime() - Date.now()) / 1000,
                    ).toString(),
                },
            },
        );
    }

    // ── Step 3: Parse and validate request ──
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const rawFolder =
            (formData.get("folder") as string) || "daily_nutrition_uploads";
        const folderId = formData.get("folderId") as string | null;

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 },
            );
        }

        // ── Step 4: Folder sanitization (prevent path traversal) ──
        if (!SAFE_FOLDER_REGEX.test(rawFolder)) {
            return NextResponse.json(
                { error: "Invalid folder name" },
                { status: 400 },
            );
        }
        const folder = rawFolder.replace(/\.{2,}/g, ""); // Remove any remaining .. sequences

        // ── Step 5: Strict MIME validation ──
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json(
                { error: `File type "${file.type}" is not allowed` },
                { status: 400 },
            );
        }

        // ── Step 6: Size validation ──
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    error: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
                },
                { status: 400 },
            );
        }

        // ── Step 7: Upload to Cloudinary ──
        const cloudinary = await getCloudinary();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resourceType = getResourceType(file.type);

        const uploadOptions: UploadOptions = {
            folder,
            resource_type: resourceType,
        };

        // Apply WebP optimization to static images (bypassing SVGs and GIFs)
        if (
            resourceType === "image" &&
            file.type !== "image/svg+xml" &&
            file.type !== "image/gif"
        ) {
            uploadOptions.format = "webp";
            uploadOptions.quality = "auto";
        }

        const result = await new Promise<UploadApiResponse>(
            (resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (
                        error: UploadApiErrorResponse | undefined,
                        result: UploadApiResponse | undefined,
                    ) => {
                        if (error) reject(error);
                        else if (result) resolve(result);
                    },
                ).end(buffer);
            },
        );

        // ── Step 8: DB Sync — Create MediaFile record ──
        const mediaFile = await prisma.mediaFile.create({
            data: {
                publicId: result.public_id,
                url: result.secure_url,
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                folderId: folderId || undefined,
            },
        });

        // ── Step 9: Audit logging ──
        logAudit({
            action: "MEDIA_UPLOADED",
            entity: "MediaFile",
            entityId: mediaFile.id,
            userId: session.user?.id,
            metadata: {
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                folder,
                ip,
            },
        });

        // ── Step 10: Return response with security headers ──
        const response = NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            size: file.size,
            mimeType: file.type,
        });

        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        return response;
    } catch (error: unknown) {
        // Log error details in development; generic message in production
        const message =
            error instanceof Error ? error.message : "Unknown error occurred";
        if (process.env.NODE_ENV === "development") {
            console.error("[UPLOAD] Upload error details:", message);
        } else {
            console.error("[UPLOAD] Upload failed (production)");
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    process.env.NODE_ENV === "development"
                        ? message
                        : "Upload failed. Please try again.",
            },
            { status: 500 },
        );
    }
}
