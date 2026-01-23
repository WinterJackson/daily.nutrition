"use client"

import { EditorSidebar } from "@/components/admin/blog/EditorSidebar"
import { RichTextToolbar } from "@/components/admin/blog/RichTextToolbar"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"

export function BlogEditor() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "Draft" as "Draft" | "Published",
    category: "Education",
    date: "", // Initialize empty
  })
  
  // Set date on client side only to avoid hydration mismatch
  useEffect(() => {
    if (!formData.date) {
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split("T")[0] }))
    }
  }, [])

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertToken = (token: string, cursorOffset: number) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.content
    const before = text.substring(0, start)
    const after = text.substring(end)

    const newText = before + token + after
    setFormData((prev) => ({ ...prev, content: newText }))

    // Restore focus and cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset)
    }, 0)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSaving(false)
    setLastSaved(new Date())
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-charcoal pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-charcoal/90 backdrop-blur-md border-b border-neutral-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blog"
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-olive dark:text-off-white hidden md:block">
              {formData.title || "Untitled Post"}
            </h1>
            <span className="px-2 py-0.5 rounded text-xs bg-neutral-100 dark:bg-white/10 text-neutral-500">
               {formData.status}
            </span>
          </div>

          <div className="flex items-center gap-4">
             {lastSaved && (
                <span className="text-xs text-neutral-400 flex items-center gap-1.5 animate-in fade-in">
                   <CheckCircle className="w-3 h-3" />
                   Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
             )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Main Editor Area */}
          <div className="xl:col-span-3 space-y-6">
             <Input
               placeholder="Post Title"
               value={formData.title}
               onChange={(e) => handleChange("title", e.target.value)}
               className="text-3xl md:text-4xl font-bold font-serif border-none bg-transparent px-0 placeholder:text-neutral-300 focus-visible:ring-0 h-auto py-2"
             />

             <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-neutral-200 dark:border-white/10 overflow-hidden min-h-[600px] flex flex-col">
                 <div className="border-b border-neutral-200 dark:border-white/10 px-4 flex items-center gap-4 bg-neutral-50/50 dark:bg-white/[0.02]">
                    <button
                       onClick={() => setActiveTab("write")}
                       className={cn(
                          "py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                          activeTab === "write" 
                            ? "border-olive text-olive dark:border-brand-green dark:text-brand-green" 
                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 border-b-2"
                       )}
                    >
                       <FileText className="w-4 h-4" />
                       Write
                    </button>
                    <button
                       onClick={() => setActiveTab("preview")}
                       className={cn(
                          "py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                          activeTab === "preview" 
                            ? "border-olive text-olive dark:border-brand-green dark:text-brand-green" 
                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                       )}
                    >
                       <Eye className="w-4 h-4" />
                       Preview
                    </button>
                    
                    <div className="flex-1" />
                    <span className="text-xs text-neutral-400">Markdown supported</span>
                 </div>

                 {activeTab === "write" ? (
                    <>
                       <RichTextToolbar onInsert={insertToken} />
                       <textarea 
                          ref={textareaRef}
                          value={formData.content}
                          onChange={(e) => handleChange("content", e.target.value)}
                          placeholder="Tell your story..."
                          className="flex-1 w-full p-6 bg-transparent border-none resize-none focus:ring-0 font-mono text-sm leading-relaxed text-neutral-800 dark:text-neutral-200"
                       />
                    </>
                 ) : (
                    <div className="flex-1 p-8 prose prose-neutral dark:prose-invert max-w-none overflow-y-auto">
                       {/* This is a simple markdown render. In a real app, use a dedicated library */}
                       {formData.content ? (
                           <div className="markdown-preview">
                              <ReactMarkdown>{formData.content}</ReactMarkdown>
                           </div>
                       ) : (
                           <p className="text-neutral-400 italic">Nothing to preview yet.</p>
                       )}
                    </div>
                 )}
             </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
             <div className="xl:sticky xl:top-28">
                <EditorSidebar 
                   status={formData.status}
                   category={formData.category}
                   date={formData.date}
                   onChange={handleChange}
                   onSave={handleSave}
                   isSaving={isSaving}
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
