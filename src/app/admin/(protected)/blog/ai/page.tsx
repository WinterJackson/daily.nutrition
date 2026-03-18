import { AiDashboardClient } from "@/components/admin/blog/AiDashboardClient"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AiDashboardPage() {
    const user = await getCurrentUser()
    if (!user) redirect("/admin/login")

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <AiDashboardClient userRole={user.role} />
        </div>
    )
}
