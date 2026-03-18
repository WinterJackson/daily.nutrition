"use client"

import { MediaPickerModal } from "@/components/admin/MediaPickerModal"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Input } from "@/components/ui/Input"
import { Calendar, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface EditorSidebarProps {
  status: "Draft" | "Published"
  category: string
  date: string
  image: string | null
  metaTitle: string
  metaDescription: string
  onChange: (key: string, value: string) => void
  onSave: (publishAction?: "publish" | "review") => void
  isSaving: boolean
  userRole?: string
}

const categories = ["Education", "Announcement", "Nutrition Tips", "Research", "Recipe"]

export function EditorSidebar({ status, category, date, image, metaTitle, metaDescription, onChange, onSave, isSaving, userRole = "ADMIN" }: EditorSidebarProps) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const handleMediaSelect = (url: string) => {
    onChange("image", url)
  }

  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleRemoveImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowRemoveConfirm(true)
  }

  const handleConfirmRemoveImage = () => {
    onChange("image", "")
    setShowRemoveConfirm(false)
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

          {/* RBAC: Role-aware save buttons */}
          <div className="space-y-2 mt-2">
            <Button 
              variant="accent" 
              className="w-full" 
              onClick={() => onSave()}
              disabled={isSaving}
            >
               {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            {userRole === "SUPER_ADMIN" ? (
              <Button 
                variant="accent" 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => onSave("publish")}
                disabled={isSaving}
              >
                 {isSaving ? "Publishing..." : "Publish Now"}
              </Button>
            ) : (
              <Button 
                variant="accent" 
                className="w-full" 
                onClick={() => onSave("review")}
                disabled={isSaving}
              >
                 {isSaving ? "Submitting..." : "Submit for Review"}
              </Button>
            )}
          </div>
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
             onClick={() => !image && setIsMediaPickerOpen(true)}
             className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors overflow-hidden ${
               image ? "border-solid border-transparent p-0 cursor-default" : "border-neutral-200 dark:border-white/10 cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5"
             }`}
           >
               {image ? (
                 <div className="relative w-full aspect-video group">
                    <Image 
                      src={image} 
                      alt="Featured" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <Button size="sm" variant="secondary" onClick={() => setIsMediaPickerOpen(true)}>Change Media</Button>
                    </div>
                    <button 
                      onClick={handleRemoveImageClick}
                      className="absolute top-2 right-2 p-1 bg-white/20 backdrop-blur-md rounded-full hover:bg-red-500 hover:text-white transition-colors text-white"
                    >
                       <X className="w-4 h-4" />
                    </button>
                 </div>
               ) : (
                 <>
                   <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center mb-3">
                      <ImageIcon className="w-5 h-5 text-neutral-400" />
                   </div>
                   <p className="text-xs text-neutral-500 font-medium">Click to choose media</p>
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
              <Input 
                placeholder="SEO Title" 
                className="text-xs" 
                value={metaTitle}
                onChange={(e) => onChange("metaTitle", e.target.value)}
              />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Meta Description</label>
              <textarea 
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs h-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green dark:border-white/10 dark:bg-white/5" 
                placeholder="Short summary..."
                value={metaDescription}
                onChange={(e) => onChange("metaDescription", e.target.value)}
              />
           </div>
        </CardContent>
      </Card>
      <ConfirmationDialog 
        open={showRemoveConfirm} 
        onOpenChange={setShowRemoveConfirm}
        title="Remove Featured Image"
        description="Are you sure you want to remove the featured image?"
        confirmText="Remove Image"
        variant="destructive"
        onConfirm={handleConfirmRemoveImage}
      />

      <MediaPickerModal 
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={handleMediaSelect}
        folder="daily_nutrition/featured"
        allowedTypes="image"
      />
    </div>
  )
}
