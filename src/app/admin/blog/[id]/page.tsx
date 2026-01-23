import { BlogEditor } from "@/components/admin/blog/BlogEditor"

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }]
}

export default function EditPostPage() {
  // In a real app, you would fetch data here based on params.id
  // and pass it to BlogEditor as initialData
  return <BlogEditor />
}
