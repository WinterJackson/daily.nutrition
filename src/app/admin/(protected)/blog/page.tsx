import { getPosts } from "@/app/actions/blog"
import { BlogListClient } from "@/components/admin/blog/BlogListClient"

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const pageSize = 10
  
  const { posts, totalCount } = await getPosts(false, page, pageSize)

  return <BlogListClient initialPosts={posts} totalCount={totalCount} currentPage={page} pageSize={pageSize} />
}
