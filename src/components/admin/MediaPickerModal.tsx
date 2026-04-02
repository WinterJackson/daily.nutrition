"use client";

import { getMediaFiles } from "@/app/actions/media";
import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import { convertToWebP } from "@/lib/webp-converter";
import { MediaFile } from "@prisma/client";
import { FileImage, FileVideo, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";

interface MediaPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string, publicId: string) => void;
    folder?: string; // Prefix/folder to upload to if uploading new
    allowedTypes?: "all" | "image" | "video";
}

export function MediaPickerModal({
    open,
    onOpenChange,
    onSelect,
    folder = "daily_nutrition_uploads",
    allowedTypes = "all",
}: MediaPickerModalProps) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, startTransition] = useTransition();
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            loadFiles();
        }
    }, [open]);

    const loadFiles = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await getMediaFiles();
            if (res.success && res.files) {
                setFiles(res.files);
            } else {
                setError(res.error || "Failed to load media.");
            }
        } catch {
            setError("Failed to load media.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawFile = e.target.files?.[0];
        if (!rawFile) return;

        setError("");

        startTransition(async () => {
            try {
                // Client-side WebP optimization if image
                let finalFile = rawFile;
                if (rawFile.type.startsWith("image/")) {
                    finalFile = await convertToWebP(rawFile);
                }

                const formData = new FormData();
                formData.append("file", finalFile);
                formData.append("folder", folder);

                // Use API route instead of server action to bypass 1MB body size limit
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const res = await response.json();

                if (res.success && res.url && res.publicId) {
                    // Prepend to top of list and auto-select
                    const newFile: MediaFile = {
                        id: "temp-" + Date.now(),
                        publicId: res.publicId,
                        url: res.url,
                        filename: rawFile.name,
                        size: res.size || rawFile.size,
                        mimeType: res.mimeType || rawFile.type,
                        folderId: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: null,
                    };
                    setFiles((prev) => [newFile, ...prev]);
                    // Automatically pass the newly uploaded file up
                    onSelect(res.url, res.publicId);
                    onOpenChange(false);
                } else {
                    setError(res.error || "Upload failed");
                }
            } catch {
                setError("Unexpected error during upload");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        });
    };

    const filteredFiles = files.filter((f) => {
        if (allowedTypes === "image") return f.mimeType.startsWith("image/");
        if (allowedTypes === "video") return f.mimeType.startsWith("video/");
        return true;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between mt-2">
                        <div>
                            <DialogTitle>Media Library</DialogTitle>
                            <DialogDescription>
                                Select an existing file or upload a new one.
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2 mr-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept={
                                    allowedTypes === "image"
                                        ? "image/*"
                                        : allowedTypes === "video"
                                          ? "video/mp4,video/webm"
                                          : "image/*,video/mp4,video/webm"
                                }
                            />
                            <Button
                                onClick={handleUploadClick}
                                disabled={isUploading}
                                size="sm"
                                variant="accent"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-4 h-4 mr-2" />{" "}
                                        Upload New
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto mt-4 px-1 rounded-md border border-neutral-100 dark:border-white/5 bg-neutral-50/50 dark:bg-black/10 p-4">
                    {error && (
                        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-green" />
                            <p>Loading media...</p>
                        </div>
                    ) : (
                        <>
                            {filteredFiles.length === 0 ? (
                                <div className="text-center py-20 text-neutral-400">
                                    <FileImage className="w-12 h-12 mx-auto opacity-50 mb-3" />
                                    <p>No compatible media found.</p>
                                    <p className="text-sm">
                                        Click &quot;Upload New&quot; to add
                                        files.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredFiles.map((file) => {
                                        const isVideo =
                                            file.mimeType.startsWith("video/");

                                        return (
                                            <div
                                                key={file.id}
                                                onClick={() => {
                                                    onSelect(
                                                        file.url,
                                                        file.publicId,
                                                    );
                                                    onOpenChange(false);
                                                }}
                                                className="group relative surface-card rounded-lg overflow-hidden border border-subtle hover:border-brand-green cursor-pointer hover:shadow-md transition-all flex flex-col"
                                            >
                                                <div className="relative aspect-video bg-neutral-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                                    {isVideo ? (
                                                        <video
                                                            src={file.url}
                                                            className="w-full h-full object-cover"
                                                            muted
                                                            playsInline
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={file.url}
                                                            alt={file.filename}
                                                            fill
                                                            sizes="200px"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    )}

                                                    <div className="absolute inset-0 bg-brand-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                        <span className="bg-brand-green text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                            Select
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-2 bg-white dark:bg-black/20 flex items-center gap-2 border-t border-subtle">
                                                    {isVideo ? (
                                                        <FileVideo className="w-3 h-3 text-blue-500 shrink-0" />
                                                    ) : (
                                                        <FileImage className="w-3 h-3 text-brand-green shrink-0" />
                                                    )}
                                                    <p
                                                        className="text-[10px] font-medium truncate flex-1"
                                                        title={file.filename}
                                                    >
                                                        {file.filename}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
