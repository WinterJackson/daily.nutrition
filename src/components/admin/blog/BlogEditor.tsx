"use client"

import { createPost, updatePost } from "@/app/actions/blog"
import { EditorSidebar } from "@/components/admin/blog/EditorSidebar"
import { RichTextToolbar } from "@/components/admin/blog/RichTextToolbar"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"

interface BlogEditorProps {
  initialData?: {
    id?: string
    title: string
    content: string
    published: boolean
    category: string
    image: string | null
    createdAt?: Date
  }
}

export function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    status: (initialData?.published ? "Published" : "Draft") as "Published" | "Draft",
    category: initialData?.category || "Education",
    image: initialData?.image || null,
    date: initialData?.createdAt ? new Date(initialData.createdAt).toISOString().split("T")[0] : "",
  })
  
  useEffect(() => {
    if (!formData.date) {
        setFormData(prev => ({ ...prev, date: new Date().toISOString().split("T")[0] }))
    }
  }, [])

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [isPending, startTransition] = useTransition()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [history, setHistory] = useState<string[]>([])
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
   * Robust Token Insertion Logic
   * 
   * Modes:
   * - 'wrap': Wraps selected text (or placeholder) with prefix/suffix. E.g. **text**
   * - 'block': Prepends prefix to the START of the current line. E.g. # Heading
   * - 'insert': Inserts template at cursor. E.g. [Link](url)
   */
  const insertToken = (mode: 'wrap' | 'block' | 'insert', prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Use stored selection (captured before focus loss)
    const { start, end } = selectionRef.current
    const text = formData.content
    
    // Validate selection bounds
    const safeStart = Math.min(start, text.length)
    const safeEnd = Math.min(end, text.length)

    pushHistory(text)

    let newText = ""
    let newCursorStart = 0
    let newCursorEnd = 0

    if (mode === 'wrap') {
      // WRAP MODE: Surrounds selected text (or inserts placeholder)
      const before = text.substring(0, safeStart)
      const selected = text.substring(safeStart, safeEnd)
      const after = text.substring(safeEnd)
      
      if (selected.length > 0) {
        // User has selected text - wrap it
        newText = `${before}${prefix}${selected}${suffix}${after}`
        newCursorStart = safeStart + prefix.length
        newCursorEnd = newCursorStart + selected.length
      } else {
        // No selection - insert placeholder "text"
        const placeholder = "text"
        newText = `${before}${prefix}${placeholder}${suffix}${after}`
        newCursorStart = safeStart + prefix.length
        newCursorEnd = newCursorStart + placeholder.length
      }
    }
    
    else if (mode === 'block') {
      // BLOCK MODE: Prepends to BEGINNING of current line
      // Find the start of the line containing the cursor
      const beforeCursor = text.substring(0, safeStart)
      const lineStartIndex = beforeCursor.lastIndexOf('\n') + 1
      
      // Build new text: everything before line start + prefix + rest of content from line start
      const beforeLine = text.substring(0, lineStartIndex)
      const lineAndAfter = text.substring(lineStartIndex)
      
      newText = `${beforeLine}${prefix}${lineAndAfter}`
      
      // Move cursor by the length of the prefix
      newCursorStart = safeEnd + prefix.length
      newCursorEnd = newCursorStart
    }
    
    else if (mode === 'insert') {
      // INSERT MODE: Simple insertion at cursor, with smart placeholder selection
      const before = text.substring(0, safeStart)
      const after = text.substring(safeEnd)
      
      newText = `${before}${prefix}${after}`
      
      // Smart cursor positioning for templates
      if (prefix.includes('[Link text](url)')) {
        // Select "Link text" for easy replacement
        newCursorStart = safeStart + 1  // After [
        newCursorEnd = safeStart + 10   // Before ]
      } else if (prefix.includes('![Alt text](image_url)')) {
        // Select "Alt text" for easy replacement
        newCursorStart = safeStart + 2  // After ![
        newCursorEnd = safeStart + 10   // Before ]
      } else {
        // Default: place cursor at end of insertion
        newCursorStart = safeStart + prefix.length
        newCursorEnd = newCursorStart
      }
    }

    // Update state
    setFormData(prev => ({ ...prev, content: newText }))

    // Update selection ref for potential chained operations
    selectionRef.current = { start: newCursorEnd, end: newCursorEnd }

    // Restore focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
    }, 0)
  }

  const handleSave = async () => {
    startTransition(async () => {
        const payload = {
            title: formData.title,
            content: formData.content,
            published: formData.status === "Published",
            category: formData.category,
            image: formData.image
        }

        if (initialData?.id) {
            await updatePost(initialData.id, payload)
        } else {
            const res = await createPost(payload)
            if (res.success && res.post) {
                // Redirect to edit page or list? 
                // List is safer to avoid stale state issues or tricky redirects inside transition
                router.push("/admin/blog")
            }
        }
        setLastSaved(new Date())
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
                            <RichTextToolbar onInsert={insertToken} onUndo={handleUndo} canUndo={history.length > 0} />
                        </div>
                     )}
                 </div>

                 {activeTab === "write" ? (
                    <div className="relative group">
                       <textarea 
                          ref={textareaRef}
                          value={formData.content}
                          onChange={(e) => handleChange("content", e.target.value)}
                          onSelect={captureSelection}
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
                               <ReactMarkdown rehypePlugins={[rehypeRaw]}>{formData.content}</ReactMarkdown>
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
                   onChange={handleChange}
                   onSave={handleSave}
                   isSaving={isPending}
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
