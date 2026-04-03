"use client"

import { createPost, updatePost } from "@/app/actions/blog"
import { DraftGeneratorModal } from "@/components/admin/blog/DraftGeneratorModal"
import { EditorSidebar } from "@/components/admin/blog/EditorSidebar"
import { RichTextToolbar } from "@/components/admin/blog/RichTextToolbar"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Eye, FileText, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

interface BlogEditorProps {
  userRole?: string
  initialData?: {
    id?: string
    title: string
    content: string
    published: boolean
    category: string
    image: string | null
    metaTitle?: string | null
    metaDescription?: string | null
    createdAt?: Date
    version?: number
  }
}

export function BlogEditor({ initialData, userRole = "ADMIN" }: BlogEditorProps) {
  const router = useRouter()
  const [versionConflict, setVersionConflict] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    status: (initialData?.published ? "Published" : "Draft") as "Published" | "Draft",
    category: initialData?.category || "Education",
    image: initialData?.image || null,
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    date: initialData?.createdAt ? new Date(initialData.createdAt).toISOString().split("T")[0] : "",
  })
  
  useEffect(() => {
    if (!formData.date) {
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split("T")[0] }))
    }
  }, [])

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [isPending, startTransition] = useTransition()
  const [savingAction, setSavingAction] = useState<"draft" | "publish" | "review" | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [showAiModal, setShowAiModal] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // CRITICAL: Track selection separately because clicking toolbar buttons causes focus loss
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 })

  // Capture selection on every relevant textarea event
  const captureSelection = () => {
    if (textareaRef.current) {
      selectionRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      }
    }
  }

  const handleUndo = () => {
    if (history.length === 0) return
    const previousContent = history[history.length - 1]
    const newHistory = history.slice(0, -1)
    setHistory(newHistory)
    setFormData(prev => ({ ...prev, content: previousContent }))
  }

  const pushHistory = (content: string) => {
    setHistory(prev => [...prev.slice(-49), content]) // Keep last 50 states
  }

  /**
   * Advanced Token Insertion Logic with Toggle Support
   */
  const insertToken = (mode: 'wrap' | 'block' | 'insert', prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Use stored selection (captured before focus loss)
    const { start, end } = selectionRef.current
    const text = formData.content
    
    // Validate bounds
    const safeStart = Math.min(start, text.length)
    const safeEnd = Math.min(end, text.length)

    pushHistory(text)

    let newText = ""
    let newCursorStart = 0
    let newCursorEnd = 0

    if (mode === 'wrap') {
      const before = text.substring(0, safeStart)
      const selected = text.substring(safeStart, safeEnd)
      const after = text.substring(safeEnd)
      
      // Check if already wrapped to Toggle OFF
      const prefixLen = prefix.length
      const suffixLen = suffix.length
      
      const surroundingPrefix = text.substring(safeStart - prefixLen, safeStart)
      const surroundingSuffix = text.substring(safeEnd, safeEnd + suffixLen)

      if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
          // Wrapped around selection -> Unwrap
          const beforeUnwrap = text.substring(0, safeStart - prefixLen)
          const afterUnwrap = text.substring(safeEnd + suffixLen)
          
          newText = `${beforeUnwrap}${selected}${afterUnwrap}`
          newCursorStart = safeStart - prefixLen
          newCursorEnd = safeEnd - prefixLen
      } else {
          // Check if selection itself contains the wrap (e.g. selected "**text**")
          if (selected.startsWith(prefix) && selected.endsWith(suffix) && selected.length >= prefixLen + suffixLen) {
              const inner = selected.substring(prefixLen, selected.length - suffixLen)
              newText = `${before}${inner}${after}`
              newCursorStart = safeStart
              newCursorEnd = safeStart + inner.length
          } else {
             // Wrap it
             if (selected.length > 0) {
                newText = `${before}${prefix}${selected}${suffix}${after}`
                newCursorStart = safeStart + prefixLen
                newCursorEnd = newCursorStart + selected.length
             } else {
                const placeholder = "text"
                newText = `${before}${prefix}${placeholder}${suffix}${after}`
                newCursorStart = safeStart + prefixLen
                newCursorEnd = newCursorStart + placeholder.length
             }
          }
      }
    }
    
    else if (mode === 'block') {
      // BLOCK MODE: Handle Multiline Selection with Toggle
      const beforeSelection = text.substring(0, safeStart)
      const lineStart = beforeSelection.lastIndexOf('\n') + 1
      
      let lineEnd = text.indexOf('\n', safeEnd)
      if (lineEnd === -1) lineEnd = text.length

      const contentToProcess = text.substring(lineStart, lineEnd)
      const lines = contentToProcess.split('\n')

      // Determine if this is a heading prefix
      const isHeadingPrefix = /^#{1,6} $/.test(prefix)
      // Determine if this is a list prefix
      const isNumberedList = prefix === '1. '
      
      // Toggle Logic: If ALL lines have the exact prefix -> remove. Else -> add/replace.
      const allStartWithPrefix = lines.length > 0 && lines.every(line => line.startsWith(prefix))
      
      let processedLines: string[] = []
      
      if (allStartWithPrefix) {
          // Toggle OFF: remove the prefix from each line
          processedLines = lines.map(line => line.substring(prefix.length))
      } else {
          processedLines = lines.map((line, idx) => {
              // For headings: strip any existing heading prefix before applying new one
              if (isHeadingPrefix) {
                  const strippedLine = line.replace(/^#{1,6} /, '')
                  return prefix + strippedLine
              }
              // For numbered lists: auto-increment
              if (isNumberedList) {
                  // Strip existing numbered list prefix if present
                  const strippedLine = line.replace(/^\d+\. /, '')
                  return `${idx + 1}. ${strippedLine}`
              }
              // For bullet lists & quotes: simple toggle on
              return line.startsWith(prefix) ? line : prefix + line
          })
      }
      
      const newBlock = processedLines.join('\n')
      
      newText = text.substring(0, lineStart) + newBlock + text.substring(lineEnd)
      
      newCursorStart = lineStart
      newCursorEnd = lineStart + newBlock.length
    }
    
    else if (mode === 'insert') {
      const before = text.substring(0, safeStart)
      const after = text.substring(safeEnd)
      const selected = text.substring(safeStart, safeEnd)
      
      if (prefix.includes('[Link text](url)')) {
          if (selected) {
             newText = `${before}[${selected}](url)${after}`
             newCursorStart = safeStart + selected.length + 3
             newCursorEnd = newCursorStart + 3
          } else {
             newText = `${before}${prefix}${after}`
             newCursorStart = safeStart + 1
             newCursorEnd = safeStart + 10
          }
      } else if (prefix.includes('![Alt text](image_url)')) {
          if (selected) {
             newText = `${before}![${selected}](image_url)${after}`
             newCursorStart = safeStart + selected.length + 4
             newCursorEnd = newCursorStart + 9
          } else {
             newText = `${before}${prefix}${after}`
             newCursorStart = safeStart + 2
             newCursorEnd = safeStart + 10
          }
      } else {
         newText = `${before}${prefix}${after}`
         newCursorStart = safeStart + prefix.length
         newCursorEnd = newCursorStart
      }
    }

    setFormData(prev => ({ ...prev, content: newText }))
    selectionRef.current = { start: newCursorEnd, end: newCursorEnd }

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
          e.preventDefault()
          
          const textarea = textareaRef.current
          if (!textarea) return
          
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const text = formData.content
          
          pushHistory(text)
          
          // Insert 2 spaces
          const spaces = "  "
          const newText = text.substring(0, start) + spaces + text.substring(end)
          
          setFormData(prev => ({ ...prev, content: newText }))
          
          setTimeout(() => {
             textarea.selectionStart = textarea.selectionEnd = start + spaces.length
             selectionRef.current = { start: start + spaces.length, end: start + spaces.length }
          }, 0)
      }
  }

  const handleSave = async (publishAction?: "publish" | "review") => {
    // Track which button triggered the save so only THAT button shows loading
    const actionType = publishAction === "publish" ? "publish" : publishAction === "review" ? "review" : "draft"
    setSavingAction(actionType)

    startTransition(async () => {
        const canPublish = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
        const isPublish = publishAction === "publish" && canPublish
        const isSubmitForReview = publishAction === "review"

        let derivedStatus: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED" = formData.status === "Published" ? "PUBLISHED" : "DRAFT"
        if (isPublish) derivedStatus = "PUBLISHED"
        if (isSubmitForReview) derivedStatus = "IN_REVIEW"

        const payload = {
            title: formData.title,
            content: formData.content,
            published: isPublish ? true : (isSubmitForReview ? false : formData.status === "Published"),
            status: derivedStatus,
            category: formData.category,
            image: formData.image,
            metaTitle: formData.metaTitle,
            metaDescription: formData.metaDescription,
            version: initialData?.version,
        }

        if (initialData?.id) {
            const res = await updatePost(initialData.id, payload)
            if (!res.success && res.error?.includes("modified by another user")) {
                setVersionConflict(true)
                setSavingAction(null)
                return
            }
        } else {
            const res = await createPost(payload)
            if (res.success && res.post) {
                router.push("/admin/blog")
            }
        }
        setLastSaved(new Date())
        setSavingAction(null)
    })
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-charcoal pb-20">
      {/* Top Bar */}
      <div className="sticky top-4 z-30 bg-white/90 dark:bg-charcoal/90 backdrop-blur-md border border-neutral-200 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-4 mx-4 rounded-[10px] shadow-sm">
        <div className="mx-auto flex items-center justify-between">
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
             {versionConflict && (
                <span className="text-xs text-red-500 flex items-center gap-1.5 animate-in fade-in">
                   ⚠️ Conflict detected — please reload
                </span>
             )}
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

             {/* Modern Editor Container - Distraction Free */}
             <div className="relative min-h-[calc(100vh-200px)]">
                 
                 {/* Floating Tabs & Toolbar Container */}
                 <div className="sticky top-24 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 transition-all duration-300">
                     
                     {/* Modern IOS-style Segmented Control */}
                     <div className="bg-neutral-100 dark:bg-white/5 p-1 rounded-full inline-flex border border-neutral-200 dark:border-white/5 shadow-inner">
                        <button
                           onClick={() => setActiveTab("write")}
                           className={cn(
                              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                              activeTab === "write" 
                                ? "bg-white dark:bg-charcoal text-olive dark:text-off-white shadow-sm ring-1 ring-black/5" 
                                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                           )}
                        >
                           <FileText className="w-3.5 h-3.5" />
                           Write
                        </button>
                        <button
                           onClick={() => setActiveTab("preview")}
                           className={cn(
                              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                              activeTab === "preview" 
                                ? "bg-white dark:bg-charcoal text-olive dark:text-off-white shadow-sm ring-1 ring-black/5" 
                                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                           )}
                        >
                           <Eye className="w-3.5 h-3.5" />
                           Preview
                        </button>
                     </div>

                     {/* Toolbar shows only when Writing */}
                     {activeTab === "write" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <RichTextToolbar 
                                onInsert={insertToken} 
                                onUndo={handleUndo} 
                                canUndo={history.length > 0}
                            />
                        </div>
                     )}
                 </div>

                 {/* AI Generative Zero-State Button */}
                 {activeTab === "write" && !formData.title.trim() && !formData.content.trim() && (
                    <div className="absolute top-32 inset-x-0 flex justify-center z-10 pointer-events-none">
                        <button 
                            onClick={() => setShowAiModal(true)}
                            className="pointer-events-auto group px-6 py-3 rounded-full bg-white dark:bg-charcoal border border-orange/20 shadow-xl shadow-orange/10 flex items-center gap-3 hover:scale-105 hover:border-orange/40 transition-all duration-300"
                        >
                            <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center">
                               <Sparkles className="w-4 h-4 text-orange group-hover:animate-pulse" />
                            </div>
                            <span className="font-semibold bg-gradient-to-r from-orange to-brand-green bg-clip-text text-transparent">
                                Generate with AI
                            </span>
                        </button>
                    </div>
                 )}

                 {activeTab === "write" ? (
                    <div className="relative group">
                       <textarea 
                          ref={textareaRef}
                          value={formData.content}
                          onChange={(e) => handleChange("content", e.target.value)}
                          onSelect={captureSelection}
                          onKeyDown={handleKeyDown}
                          onKeyUp={captureSelection}
                          onClick={captureSelection}
                          onMouseUp={captureSelection}
                          onBlur={captureSelection}
                          placeholder="Tell your story..."
                          className="w-full min-h-[600px] p-0 bg-transparent border-none resize-none focus:ring-0 text-lg md:text-xl leading-relaxed text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-300 font-serif font-normal selection:bg-brand-green/20"
                          style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
                       />
                       {/* Subtle character count */}
                       <div className="absolute bottom-4 right-0 text-xs text-neutral-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          {formData.content.length} chars
                       </div>
                    </div>
                 ) : (
                    <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                       {/* Enhanced Preview Container */}
                       <div className="markdown-preview p-4 md:p-8 bg-white dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5 shadow-sm min-h-[600px]">
                           {formData.content ? (
                               <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
                           ) : (
                               <div className="h-full flex items-center justify-center text-neutral-400 italic">
                                   Start writing to see your preview here.
                               </div>
                           )}
                       </div>
                    </div>
                 )}
             </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 order-first xl:order-last">
             <div className="xl:sticky xl:top-28">
                <EditorSidebar 
                   status={formData.status}
                   category={formData.category}
                   date={formData.date}
                   image={formData.image}
                   metaTitle={formData.metaTitle}
                   metaDescription={formData.metaDescription}
                   onChange={handleChange}
                   onSave={handleSave}
                   isSaving={isPending}
                   savingAction={savingAction}
                   userRole={userRole}
                />
             </div>
          </div>

        </div>
      </div>
      
      {/* AI Draft Generator Modal */}
      <DraftGeneratorModal 
          isOpen={showAiModal} 
          onClose={() => setShowAiModal(false)} 
          onGenerate={(title, content) => {
              setFormData(prev => ({ ...prev, title, content }))
              // Also update history so we can undo the AI generation if we want!
              setHistory([content])
          }}
      />
    </div>
  )
}
