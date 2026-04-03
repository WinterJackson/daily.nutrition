import { BlogEditor } from "@/components/admin/blog/BlogEditor"
import { getCurrentUser } from "@/lib/auth"

export default async function NewPostPage() {
  const user = await getCurrentUser()
  return <BlogEditor userRole={user?.role || "SUPPORT"} />
}
