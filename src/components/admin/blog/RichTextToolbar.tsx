"use client"

import { Button } from "@/components/ui/Button"
import {
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
} from "lucide-react"

interface RichTextToolbarProps {
  onInsert: (token: string, cursorOffset: number) => void
}

export function RichTextToolbar({ onInsert }: RichTextToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-black/20">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("**bold text**", 2)}
        title="Bold"
        className="h-8 w-8 p-0"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("*italic text*", 1)}
        title="Italic"
        className="h-8 w-8 p-0"
      >
        <Italic className="w-4 h-4" />
      </Button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-white/20 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("# ", 0)}
        title="Heading 1"
        className="h-8 w-8 p-0"
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("## ", 0)}
        title="Heading 2"
        className="h-8 w-8 p-0"
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("### ", 0)}
        title="Heading 3"
        className="h-8 w-8 p-0"
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-white/20 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("- List item", 0)}
        title="Bullet List"
        className="h-8 w-8 p-0"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("1. List item", 0)}
        title="Numbered List"
        className="h-8 w-8 p-0"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("> Quote", 0)}
        title="Quote"
        className="h-8 w-8 p-0"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-white/20 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("[Link text](url)", 1)}
        title="Link"
        className="h-8 w-8 p-0"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onInsert("![Alt text](image_url)", 1)}
        title="Image"
        className="h-8 w-8 p-0"
      >
        <ImageIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}
