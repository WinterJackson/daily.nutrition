import { getPost } from "@/app/actions/blog"
import { BlogEditor } from "@/components/admin/blog/BlogEditor"
import { notFound } from "next/navigation"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return <BlogEditor initialData={post} />
}
