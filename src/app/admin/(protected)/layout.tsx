import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-off-white dark:bg-charcoal relative overflow-x-hidden">
       {/* Consistent Nutrition Background for Admin */}
       <AnimatedBackground variant="nutrition" />
       
       <AdminSidebar />
       
       <main className="flex-1 min-h-screen overflow-x-hidden overflow-y-auto relative z-10 pt-[70px] lg:pt-0">
          <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-8">
             {children}
          </div>
       </main>
    </div>
  )
}
