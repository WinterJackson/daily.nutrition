"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Calendar, Upload } from "lucide-react"

interface EditorSidebarProps {
  status: "Draft" | "Published"
  category: string
  date: string
  onChange: (key: string, value: string) => void
  onSave: () => void
  isSaving: boolean
}

const categories = ["Education", "Announcement", "Nutrition Tips", "Research", "Recipe"]

export function EditorSidebar({ status, category, date, onChange, onSave, isSaving }: EditorSidebarProps) {
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
           <div className="border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
               <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-neutral-400" />
               </div>
               <p className="text-xs text-neutral-500 font-medium">Click to upload</p>
               <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG up to 2MB</p>
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
