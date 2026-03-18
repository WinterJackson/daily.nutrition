/**
 * Xinteck Pattern: Client-Side WebP Optimization
 * 
 * Converts images to WebP format entirely in the browser using HTML5 Canvas.
 * This eliminates server CPU costs and reduces bandwidth by ~80% before upload.
 * 
 * A 5MB iPhone JPEG → ~300KB WebP, entirely on the client's GPU/CPU.
 * GIFs are skipped (canvas breaks animations).
 */

const DEFAULT_QUALITY = 0.90

/**
 * Convert any image File to WebP format using the browser's Canvas API.
 * 
 * @param file - The raw File object from an <input type="file"> or drag-and-drop
 * @param quality - WebP quality (0.0 - 1.0), defaults to 0.90
 * @returns A new File object in WebP format, or the original if conversion is not applicable
 */
export async function convertToWebP(file: File, quality: number = DEFAULT_QUALITY): Promise<File> {
    // Guard: Skip non-images entirely
    if (!file.type.startsWith("image/")) {
        return file
    }

    // Guard: Skip GIFs (canvas conversion would destroy animation frames)
    if (file.type === "image/gif") {
        return file
    }

    // Guard: Already WebP — no conversion needed
    if (file.type === "image/webp") {
        return file
    }

    try {
        // Step 1: Load the image into an HTMLImageElement
        const imageBitmap = await createImageBitmap(file)

        // Step 2: Render onto a hidden Canvas
        const canvas = document.createElement("canvas")
        canvas.width = imageBitmap.width
        canvas.height = imageBitmap.height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
            console.warn("Canvas 2D context unavailable, returning original file")
            return file
        }

        ctx.drawImage(imageBitmap, 0, 0)

        // Step 3: Extract as WebP blob with specified quality
        const webpBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/webp", quality)
        })

        if (!webpBlob) {
            console.warn("WebP conversion failed, returning original file")
            return file
        }

        // Step 4: Only use WebP if it's actually smaller (edge case: tiny PNGs can grow)
        if (webpBlob.size >= file.size) {
            return file
        }

        // Step 5: Reconstruct a File object with .webp extension
        const originalName = file.name.replace(/\.[^.]+$/, "")
        const webpFile = new File(
            [webpBlob],
            `${originalName}.webp`,
            { type: "image/webp", lastModified: Date.now() }
        )

        const savings = ((1 - webpFile.size / file.size) * 100).toFixed(1)
        console.log(
            `📸 WebP Optimization: ${file.name} (${formatBytes(file.size)}) → ${webpFile.name} (${formatBytes(webpFile.size)}) | ${savings}% smaller`
        )

        return webpFile
    } catch (error) {
        console.error("WebP conversion error, returning original file:", error)
        return file
    }
}

/**
 * Human-readable byte formatter
 */
function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
