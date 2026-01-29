/**
 * Cloudinary Utility Functions
 */

/**
 * Extracts the public ID from a Cloudinary URL.
 * Handles standard URLs like:
 * https://res.cloudinary.com/demo/image/upload/v1234567890/folder/my_image.jpg
 * -> folder/my_image
 */
export function getPublicIdFromUrl(url: string): string | null {
    if (!url) return null

    try {
        // Regex to capture everything after the version number (v1234...) or upload/, up to the extension
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/
        const match = url.match(regex)

        if (match && match[1]) {
            return match[1]
        }

        return null
    } catch (e) {
        console.error("Error extracting public ID:", e)
        return null
    }
}
