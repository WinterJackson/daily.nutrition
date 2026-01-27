"use server"

import cloudinary from "@/lib/cloudinary"

export async function uploadImage(formData: FormData) {
    const file = formData.get("file") as File
    if (!file) {
        return { success: false, error: "No file provided" }
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "daily_nutrition",
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        return { success: true, url: result.secure_url }
    } catch (error) {
        console.error("Upload failed:", error)
        return { success: false, error: "Upload failed" }
    }
}
