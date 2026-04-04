import { getInquiries } from "@/app/actions/inquiries"
import { InquiriesTable } from "@/components/admin/InquiriesTable"
import { prisma } from "@/lib/prisma"

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const pageSize = 10
  
  const { inquiries, totalCount } = await getInquiries(page, pageSize)
  const users = await prisma.user.findMany({
      where: { role: { not: "SUPER_ADMIN" } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] overflow-hidden gap-4">
      {/* Header Container - Fixed Height */}
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-olive dark:text-off-white">Inquiries CRM</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage incoming messages, assign leads, and reply via email.</p>
        </div>
      </div>

      {/* Main CRM Wrapper - Fills remaining space, flex-1 min-h-0 is the magic CSS hack */}
      <div className="flex-1 min-h-0 relative">
        <InquiriesTable 
          inquiries={inquiries as any} 
          users={users}
          totalCount={totalCount} 
          currentPage={page} 
          pageSize={pageSize} 
        />
      </div>
    </div>
  )
}
