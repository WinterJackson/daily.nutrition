"use client"

import { deleteFile, uploadFile } from "@/app/actions/media"
import { Button } from "@/components/ui/Button"
import { MediaFile } from "@prisma/client"
import { Copy, FileImage, FileVideo, Loader2, Trash2, UploadCloud } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useTransition } from "react"

export default function MediaLibraryClient({ initialFiles }: { initialFiles: MediaFile[] }) {
    const [files, setFiles] = useState<MediaFile[]>(initialFiles)
    const [isPending, startTransition] = useTransition()
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError("")
        setSuccess("")
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)
            
            const res = await uploadFile(formData)
            
            if (res.success && res.url && res.publicId) {
                // Optimistically add to the UI using the response data
                const newFile: MediaFile = {
                    id: "temp-" + Date.now(),
                    publicId: res.publicId,
                    url: res.url,
                    filename: file.name,
                    size: res.size || file.size,
                    mimeType: res.mimeType || file.type,
                    folderId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null
                }
                setFiles(prev => [newFile, ...prev])
                setSuccess("File uploaded successfully")
            } else {
                setError(res.error || "Upload failed")
            }
        } catch (err) {
            setError("Unexpected error during upload")
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleDelete = (publicId: string, id: string) => {
        if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) return

        startTransition(async () => {
            setError("")
            try {
                const res = await deleteFile(publicId)
                if (res.success) {
                    setFiles(prev => prev.filter(f => f.id !== id))
                    setSuccess("File deleted")
                } else {
                    setError(res.error || "Failed to delete file")
                }
            } catch (err) {
                setError("Unexpected error during delete")
            }
        })
    }

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url)
        setSuccess("URL copied to clipboard!")
        setTimeout(() => setSuccess(""), 3000)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-olive dark:text-off-white">Media Library</h1>
                    <p className="text-caption mt-1">Manage your uploaded images and videos.</p>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange} 
                        accept="image/*,video/mp4,video/webm"
                    />
                    <Button onClick={handleUploadClick} disabled={uploading} className="shadow-lg shadow-brand-green/20">
                        {uploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                        ) : (
                            <><UploadCloud className="w-4 h-4 mr-2" /> Upload File</>
                        )}
                    </Button>
                </div>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}
            {success && <div className="p-4 bg-brand-green/20 text-brand-green rounded-xl">{success}</div>}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {files.map((file) => {
                    const isVideo = file.mimeType.startsWith('video/')
                    
                    return (
                        <div key={file.id} className="surface-card rounded-xl overflow-hidden border border-subtle group flex flex-col">
                            <div className="relative aspect-video bg-neutral-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                {isVideo ? (
                                    <video src={file.url} className="w-full h-full object-cover" muted playsInline />
                                ) : (
                                    <Image src={file.url} alt={file.filename} fill className="object-cover" />
                                )}
                                
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    <Button size="icon" variant="secondary" onClick={() => copyToClipboard(file.url)} title="Copy URL">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => handleDelete(file.publicId, file.id)} disabled={isPending} title="Delete File">
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-3 bg-white dark:bg-black/20 flex items-center gap-3">
                                {isVideo ? <FileVideo className="w-5 h-5 text-blue-500 shrink-0" /> : <FileImage className="w-5 h-5 text-brand-green shrink-0" />}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate" title={file.filename}>{file.filename}</p>
                                    <p className="text-xs text-caption">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            
            {files.length === 0 && !uploading && (
                <div className="text-center py-20 surface-card rounded-2xl border border-dashed border-subtle">
                    <FileImage className="w-12 h-12 mx-auto text-caption opacity-50 mb-4" />
                    <h3 className="text-lg font-serif">No media files found</h3>
                    <p className="text-sm text-caption mt-2">Upload images or videos to build out your library.</p>
                </div>
            )}
        </div>
    )
}
