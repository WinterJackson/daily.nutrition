import { getPost } from "@/app/actions/blog"
import { BlogEditor } from "@/components/admin/blog/BlogEditor"
import { getCurrentUser } from "@/lib/auth"
import { notFound } from "next/navigation"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, user] = await Promise.all([getPost(id), getCurrentUser()])

  if (!post) {
    notFound()
  }

  const serializedPost = {
    ...post,
    category: post.category?.name || "General",
    content: post.content || ""
  }

  return <BlogEditor initialData={serializedPost} userRole={user?.role || "SUPPORT"} />
}
