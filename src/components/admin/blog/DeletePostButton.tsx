"use client"

import { deletePost } from "@/app/actions/blog"
import { Button } from "@/components/ui/Button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      startTransition(async () => {
        await deletePost(postId)
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-neutral-500 hover:text-red-500"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
