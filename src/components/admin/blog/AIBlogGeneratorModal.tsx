"use client"

import { generateRawDraft } from "@/app/actions/ai"
import { createPost } from "@/app/actions/blog"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Bot, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AIBlogGeneratorModal() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [topic, setTopic] = useState("")
    const [tone, setTone] = useState("Professional")
    const [isGenerating, setIsGenerating] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setErrorMsg("Please enter a topic or prompt")
            setTimeout(() => setErrorMsg(""), 3000)
            return
        }

        setIsGenerating(true)
        setErrorMsg("")
        setSuccessMsg("")

        try {
            // 1. Send the Prompt to Gemini to Generate the Text
            const angleStr = `Write a ${tone.toLowerCase()} blog post. Ensure the tone is appropriate for a dietitian's website.`
            const result = await generateRawDraft(topic, angleStr)

            if (!result.success || !result.data) {
                throw new Error(result.error || "Generation failed")
            }

            // 2. Pipe the Result directly into a new Draft via the DB
            const postResult = await createPost({
                title: result.data.title,
                content: result.data.content,
                published: false,
                status: "DRAFT"
            })

            if (!postResult.success || !postResult.post) {
                throw new Error(postResult.error || "Failed to create draft record")
            }

            // 3. Navigate the user to the deeply linked BlogEditor with the new draft
            setSuccessMsg("Draft generated! Redirecting...")
            setTimeout(() => {
                setOpen(false)
                router.push(`/admin/blog/${postResult.post.id}`)
            }, 1500)
            
        } catch (error: any) {
            console.error(error)
            setErrorMsg(error.message || "Failed to generate blog post")
            setTimeout(() => setErrorMsg(""), 4000)
        } finally {
            setIsGenerating(false)
            if (!open) {
               setTopic("")
               setTone("Professional")
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-orange hover:bg-orange/90 text-white shadow-lg shadow-orange/20 rounded-full transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm">
                    <Bot className="w-4 h-4 mr-1" />
                    AI Generate
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-orange" />
                        AI Blog Generator
                    </DialogTitle>
                    <DialogDescription>
                        Enter a prompt or topic, and our AI will draft a complete, SEO-optimized blog post for you to review in the editor.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Topic or Prompt</label>
                        <Input
                            placeholder="e.g. 5 Benefits of intuitive eating for teenagers"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tone of Voice</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            disabled={isGenerating}
                            className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
                        >
                            <option value="Professional">Professional (Medical / Clinical)</option>
                            <option value="Conversational">Conversational (Warm / Empathic)</option>
                            <option value="Educational">Educational (Informative / Structured)</option>
                            <option value="Motivational">Motivational (Uplifting / Encouraging)</option>
                        </select>
                    </div>
                </div>
                <DialogFooter className="relative w-full flex items-center justify-end sm:justify-end gap-2 mt-2">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                        {errorMsg && <span className="text-xs text-red-500 font-medium animate-in fade-in">{errorMsg}</span>}
                        {successMsg && <span className="text-xs text-brand-green font-medium animate-in fade-in">{successMsg}</span>}
                        {isGenerating && !successMsg && !errorMsg && <span className="text-xs text-neutral-500 font-medium animate-pulse">Generating draft via AI...</span>}
                    </div>
                
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="bg-olive hover:bg-olive/90 text-white min-w-[120px]">
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Generate Draft"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
