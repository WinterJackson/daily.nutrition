"use client"

import { Button } from "@/components/ui/Button"
import {
    Bold,
    ChevronDown,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    RotateCcw,
    Type,
} from "lucide-react"
import { useState } from "react"

interface RichTextToolbarProps {
  onInsert: (mode: 'wrap' | 'block' | 'insert', prefix: string, suffix?: string) => void
  onUndo: () => void
  canUndo: boolean
}

const TEXT_SIZES = [
  { label: "Small", value: "small", class: "text-sm" },
  { label: "Normal", value: "normal", class: "text-base" },
  { label: "Large", value: "large", class: "text-lg" },
  { label: "X-Large", value: "xlarge", class: "text-xl" },
]

export function RichTextToolbar({ onInsert, onUndo, canUndo }: RichTextToolbarProps) {
  const [showSizeMenu, setShowSizeMenu] = useState(false)

  const handleTextSize = (size: typeof TEXT_SIZES[0]) => {
    // Using HTML span with class for size (will render in preview with proper styling)
    onInsert('wrap', `<span class="${size.class}">`, '</span>')
    setShowSizeMenu(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border border-neutral-200/50 dark:border-white/10 bg-white/80 dark:bg-charcoal/80 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Undo Button */}
      <div className="flex items-center gap-0.5 px-1 pr-2 border-r border-neutral-200 dark:border-white/10 mr-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Text Formatting: Bold, Italic */}
      <div className="flex items-center gap-0.5 px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('wrap', '**', '**')}
          title="Bold"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('wrap', '*', '*')}
          title="Italic"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <Italic className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />

      {/* Text Size Dropdown */}
      <div className="relative flex items-center px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSizeMenu(!showSizeMenu)}
          title="Text Size"
          className="h-8 px-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 flex items-center gap-1"
        >
          <Type className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </Button>
        
        {showSizeMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-charcoal border border-neutral-200 dark:border-white/10 rounded-lg shadow-lg py-1 min-w-[100px] z-50">
            {TEXT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => handleTextSize(size)}
                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-white/10 ${size.class}`}
              >
                {size.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />

      {/* Headings: H1, H2, H3 */}
      <div className="flex items-center gap-0.5 px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('block', '# ')}
          title="Heading 1"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('block', '## ')}
          title="Heading 2"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('block', '### ')}
          title="Heading 3"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />

      {/* Lists and Quote */}
      <div className="flex items-center gap-0.5 px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('block', '- ')}
          title="Bullet List"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('block', '1. ')}
          title="Numbered List"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('block', '> ')}
          title="Quote"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <Quote className="w-4 h-4" />
        </Button>
      </div>

      <div className="w-px h-4 bg-neutral-200 dark:bg-white/10 mx-1" />

      {/* Link and Image */}
      <div className="flex items-center gap-0.5 px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('insert', '[Link text](url)')}
          title="Link"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onInsert('insert', '![Alt text](image_url)')}
          title="Image"
          className="h-8 w-8 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
