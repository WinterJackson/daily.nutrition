"use client"

import { uploadImage } from "@/app/actions/upload"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Calendar, Upload, X } from "lucide-react"
import Image from "next/image"
import { useRef, useTransition } from "react"

interface EditorSidebarProps {
  status: "Draft" | "Published"
  category: string
  date: string
  image: string | null
  onChange: (key: string, value: string) => void
  onSave: () => void
  isSaving: boolean
}

const categories = ["Education", "Announcement", "Nutrition Tips", "Research", "Recipe"]

export function EditorSidebar({ status, category, date, image, onChange, onSave, isSaving }: EditorSidebarProps) {
  const [isUploading, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
        const formData = new FormData()
        formData.append("file", file)
        
        const res = await uploadImage(formData)
        if (res.success && res.url) {
            onChange("image", res.url)
        } else {
            console.error("Upload failed", res.error)
            // Ideally show a toast here
        }
    })
  }

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("image", "")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
      {/* Publish Card */}
      <Card className="border-none shadow-lg bg-white/90 dark:bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-white/5">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500">Publishing</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Status</label>
            <select
              value={status}
              onChange={(e) => onChange("status", e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green dark:border-white/10 dark:bg-white/5"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Published Date</label>
             <div className="relative">
                <Input 
                   type="date" 
                   value={date} 
                   onChange={(e) => onChange("date", e.target.value)}
                   className="pl-9"
                />
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
             </div>
          </div>

          <Button 
            variant="accent" 
            className="w-full mt-2" 
            onClick={onSave}
            disabled={isSaving}
          >
             {isSaving ? "Saving..." : "Save Post"}
          </Button>
        </CardContent>
      </Card>

      {/* Organization Card */}
      <Card className="border-none shadow-lg bg-white/90 dark:bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-white/5">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500">Organization</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
           <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Category</label>
            <select
              value={category}
              onChange={(e) => onChange("category", e.target.value)}
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green dark:border-white/10 dark:bg-white/5"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Image Card */}
      <Card className="border-none shadow-lg bg-white/90 dark:bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-white/5">
           <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500">Featured Image</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
           <div 
             onClick={handleUploadClick}
             className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer overflow-hidden ${
               isUploading ? "opacity-50 pointer-events-none" : "hover:bg-neutral-50 dark:hover:bg-white/5"
             } ${image ? "border-solid border-transparent p-0" : "border-neutral-200 dark:border-white/10"}`}
           >
               <input 
                 ref={fileInputRef}
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleFileChange}
               />
               
               {image ? (
                 <div className="relative w-full aspect-video group">
                    <Image 
                      src={image} 
                      alt="Featured" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white text-xs font-medium">Click to change</p>
                    </div>
                    <button 
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-white/20 backdrop-blur-md rounded-full hover:bg-red-500 hover:text-white transition-colors text-white"
                    >
                       <X className="w-4 h-4" />
                    </button>
                 </div>
               ) : (
                 <>
                   <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center mb-3">
                      {isUploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-green"></div> : <Upload className="w-5 h-5 text-neutral-400" />}
                   </div>
                   <p className="text-xs text-neutral-500 font-medium">
                      {isUploading ? "Uploading..." : "Click to upload"}
                   </p>
                   <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG up to 2MB</p>
                 </>
               )}
           </div>
        </CardContent>
      </Card>
      
      {/* SEO */}
      <Card className="border-none shadow-lg bg-white/90 dark:bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-neutral-100 dark:border-white/5">
           <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-500">SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
           <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Meta Title</label>
              <Input placeholder="SEO Title" className="text-xs" />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Meta Description</label>
              <textarea className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs h-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green dark:border-white/10 dark:bg-white/5" placeholder="Short summary..." />
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
