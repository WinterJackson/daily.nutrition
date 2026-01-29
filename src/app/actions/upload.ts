"use server"

import cloudinary from "@/lib/cloudinary"

export async function uploadImage(formData: FormData) {
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "daily_nutrition"

    if (!file) {
        return { success: false, error: "No file provided" }
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    transformation: [
                        { quality: "auto", fetch_format: "auto" }
                    ]
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height
        }
    } catch (error) {
        console.error("Upload failed:", error)
        return { success: false, error: "Upload failed" }
    }
}

export async function deleteImage(publicId: string) {
    if (!publicId) return { success: false, error: "No public ID provided" }

    try {
        await cloudinary.uploader.destroy(publicId)
        return { success: true }
    } catch (error) {
        console.error("Delete failed:", error)
        return { success: false, error: "Delete failed" }
    }
}
