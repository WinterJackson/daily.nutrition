import { getDashboardStats } from "@/app/actions/dashboard"
import { DashboardClient } from "@/components/admin/DashboardClient"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  
  return <DashboardClient stats={stats} />
}
