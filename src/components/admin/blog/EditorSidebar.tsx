"use client"

import { generateSeoSuggestions } from "@/app/actions/ai"
import { MediaPickerModal } from "@/components/admin/MediaPickerModal"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Input } from "@/components/ui/Input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip"
import { Calendar, ImageIcon, Info, Loader2, Sparkles, X } from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"

interface EditorSidebarProps {
  status: "Draft" | "Published"
  category: string
  date: string
  image: string | null
  metaTitle: string
  metaDescription: string
  title?: string
  content?: string
  onChange: (key: string, value: string) => void
  onSave: (publishAction?: "publish" | "review") => void
  isSaving: boolean
  savingAction?: "draft" | "publish" | "review" | null
  userRole?: string
}

const categories = ["Education", "Announcement", "Nutrition Tips", "Research", "Recipe"]

export function EditorSidebar({ 
  status, category, date, image, metaTitle, metaDescription, 
  title, content, onChange, onSave, isSaving, savingAction, userRole = "ADMIN" 
}: EditorSidebarProps) {
  const canPublish = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  // AI SEO States
  const [isGeneratingSeo, startGeneratingSeo] = useTransition()
  const [suggestedSeo, setSuggestedSeo] = useState<{title?: string, description?: string} | null>(null)

  const handleSuggestSeo = () => {
      if (!title || !content || (title.trim().length === 0 && content.trim().length === 0)) {
          alert("Please write a draft first. The AI needs content to analyze.")
          return
      }

      startGeneratingSeo(async () => {
          try {
              const res = await generateSeoSuggestions(title, content)
              if (res.success && res.data) {
                  setSuggestedSeo({ title: res.data.metaTitle, description: res.data.metaDescription })
              } else {
                  alert(res.error || "AI Generation failed")
              }
          } catch (e) {
              alert("Network error occurred during AI generation")
          }
      })
  }

  const handleMediaSelect = (url: string) => {
    onChange("image", url)
  }

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
            {canPublish ? (
              <select
                value={status}
                onChange={(e) => onChange("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green dark:border-white/10 dark:bg-white/5"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            ) : (
              <div className="flex h-10 w-full items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 text-neutral-500">
                {status === "Published" ? "Published" : "Draft"}
              </div>
            )}
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

          {/* RBAC: Role-aware action buttons */}
          <div className="space-y-2 mt-2">
            {/* Save Draft — available to ALL roles */}
            <Button 
              variant="accent" 
              className="w-full" 
              onClick={() => onSave()}
              disabled={isSaving}
            >
               {savingAction === "draft" ? "Saving..." : "Save Draft"}
            </Button>

            {/* SUPER_ADMIN & ADMIN: Can publish directly */}
            {canPublish && (
              <Button 
                variant="accent" 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                onClick={() => onSave("publish")}
                disabled={isSaving}
              >
                 {savingAction === "publish" ? "Publishing..." : "Publish Now"}
              </Button>
            )}

            {/* SUPPORT: Can only submit for review */}
            {!canPublish && (
              <Button 
                variant="accent" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={() => onSave("review")}
                disabled={isSaving}
              >
                 {savingAction === "review" ? "Submitting..." : "Submit for Review"}
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
        <CardContent className="pt-4 space-y-4">
           <TooltipProvider delayDuration={200}>
             <div className="space-y-1 relative">
                <div className="flex items-center justify-between mb-1">
                   <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                      Meta Title
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-neutral-400 hover:text-brand-green cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] p-3 text-xs leading-relaxed">
                          <p><strong>SEO Title (Max 60 characters):</strong> This will appear exactly as the large blue clickable link on Google Search. Include your main keywords. If left blank, your blog post's main title will be used instead.</p>
                        </TooltipContent>
                      </Tooltip>
                   </label>
                   <button onClick={handleSuggestSeo} disabled={isGeneratingSeo} type="button" className="text-[10px] font-semibold tracking-wide flex items-center gap-1.5 text-orange hover:text-orange/80 transition-colors uppercase disabled:opacity-50 border border-orange/20 hover:bg-orange/5 px-2 py-1 rounded-md">
                      {isGeneratingSeo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {isGeneratingSeo ? "Scanning..." : "Ask AI"}
                   </button>
                </div>
                <Input 
                  placeholder="Appears on Google Search results" 
                  className="text-xs" 
                  value={metaTitle}
                  onChange={(e) => onChange("metaTitle", e.target.value)}
                />
                {suggestedSeo?.title && (
                   <div className="mt-2 p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-md flex flex-col gap-2 shadow-inner">
                      <p className="text-xs text-brand-green/90 italic font-medium leading-relaxed">"{suggestedSeo.title}"</p>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="accent" onClick={() => { onChange("metaTitle", suggestedSeo.title!); setSuggestedSeo((prev: any) => prev ? { ...prev, title: undefined } : null) }}>Apply Suggestion</Button>
                        <Button type="button" size="sm" variant="ghost" className="text-neutral-500 hover:bg-white/50" onClick={() => setSuggestedSeo((prev: any) => prev ? { ...prev, title: undefined } : null)}>Discard</Button>
                      </div>
                   </div>
                )}
             </div>
             <div className="space-y-1 relative">
                <div className="flex items-center justify-between mb-1">
                   <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                      Meta Description
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-neutral-400 hover:text-brand-green cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] p-3 text-xs leading-relaxed">
                          <p><strong>SEO Description (Max 160 characters):</strong> The short summary snippet Google displays below the blue title. Write a compelling hook to encourage clicks. If left blank, Google automatically pulls the first paragraph.</p>
                        </TooltipContent>
                      </Tooltip>
                   </label>
                </div>
                <textarea 
                  className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs h-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green dark:border-white/10 dark:bg-white/5" 
                  placeholder="A compelling summary of the article..."
                  value={metaDescription}
                  onChange={(e) => onChange("metaDescription", e.target.value)}
                />
                {suggestedSeo?.description && (
                   <div className="mt-2 p-2.5 bg-brand-green/10 border border-brand-green/20 rounded-md flex flex-col gap-2 shadow-inner">
                      <p className="text-xs text-brand-green/90 italic font-medium leading-relaxed">"{suggestedSeo.description}"</p>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="accent" onClick={() => { onChange("metaDescription", suggestedSeo.description!); setSuggestedSeo((prev: any) => prev ? { ...prev, description: undefined } : null) }}>Apply Suggestion</Button>
                        <Button type="button" size="sm" variant="ghost" className="text-neutral-500 hover:bg-white/50" onClick={() => setSuggestedSeo((prev: any) => prev ? { ...prev, description: undefined } : null)}>Discard</Button>
                      </div>
                   </div>
                )}
             </div>
           </TooltipProvider>
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
