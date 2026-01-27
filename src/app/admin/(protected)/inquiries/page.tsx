import { getInquiries } from "@/app/actions/inquiries"
import { InquiriesTable } from "@/components/admin/InquiriesTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Mail } from "lucide-react"

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const pageSize = 10
  
  const { inquiries, totalCount } = await getInquiries(page, pageSize)

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Inquiries</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage incoming messages and consultation requests.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-orange" />
            Recent Messages ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <InquiriesTable 
            inquiries={inquiries} 
            totalCount={totalCount} 
            currentPage={page} 
            pageSize={pageSize} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
