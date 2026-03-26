import { getMediaFiles } from "@/app/actions/media"
import MediaLibraryClient from "@/components/admin/MediaLibraryClient"

export const metadata = {
    title: 'Media Library | Edwak Nutrition Admin',
}

export default async function AdminMediaPage() {
    const res = await getMediaFiles()

    if (!res.success) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-red-500">
                Failed to load media files.
            </div>
        )
    }

    return (
        <MediaLibraryClient initialFiles={res.files || []} />
    )
}
