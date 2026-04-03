import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X } from "lucide-react"
import { useState } from "react"

export interface InquiryNote {
  id: string
  content: string
  userName: string
  createdAt: Date
}

interface InquiryNotesDrawerProps {
  isOpen: boolean
  onClose: () => void
  notes: InquiryNote[]
  onAddNote: (content: string) => void
  isPending: boolean
}

export function InquiryNotesDrawer({
  isOpen,
  onClose,
  notes,
  onAddNote,
  isPending,
}: InquiryNotesDrawerProps) {
  const [noteText, setNoteText] = useState("")

  const handleAdd = () => {
    if (!noteText.trim() || isPending) return
    onAddNote(noteText)
    setNoteText("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="h-full border-l border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/20 flex flex-col shrink-0 overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-white dark:bg-[#121212]/50">
            <h3 className="font-bold text-olive dark:text-off-white text-sm">Internal Notes</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notes Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-neutral-400">
                <p className="text-sm">No internal notes yet.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-white/[0.04] p-3 rounded-xl border border-neutral-200 dark:border-white/10 shadow-sm relative group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                      {note.userName ? note.userName.charAt(0) : "S"}
                    </div>
                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      {note.userName || "System"}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 ml-auto">
                      {new Date(note.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pl-7">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Fixed Input Area */}
          <div className="p-4 border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-black/40 shrink-0 relative">
            <Textarea
              placeholder="Add a note to this lead..."
              className="min-h-[100px] resize-none pb-12 focus-visible:ring-brand-green/50 bg-white dark:bg-black/60"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={isPending}
            />
            <Button
              onClick={handleAdd}
              disabled={!noteText.trim() || isPending}
              size="sm"
              className="absolute right-6 bottom-6 h-8 rounded-md bg-brand-green hover:bg-olive text-white shadow-md disabled:opacity-50 disabled:grayscale transition-all"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Save Note
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
