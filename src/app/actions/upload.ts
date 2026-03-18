"use server"

/**
 * @deprecated This file exists for backward compatibility only.
 * All new code should import from "@/app/actions/media" instead.
 * 
 * Re-exports uploadFile as uploadImage and deleteFile as deleteImage.
 */

import { deleteFile, uploadFile } from "@/app/actions/media"

export async function deleteImage(publicId: string) {
    return await deleteFile(publicId)
}

export async function uploadImage(formData: FormData) {
    return await uploadFile(formData)
}
