import { getBlockedDates } from "@/app/actions/blocked-dates"
import { getCalendarConfig } from "@/app/actions/calendar-config"
import { Skeleton } from "@/components/ui/Skeleton"
import { Suspense } from "react"
import { ScheduleClient } from "./ScheduleClient"

export default async function SchedulePage() {
  let calendarConfig = { calendarId: "", businessName: "Edwak Nutrition", googleConfig: undefined } as any
  let blockedRes = { success: true, blockedDates: [] as any[] }
  
  try {
    calendarConfig = await getCalendarConfig()
  } catch (error) {
    console.warn("Schedule page: Failed to fetch calendar config:", error instanceof Error ? error.message : String(error))
  }

  try {
    blockedRes = await getBlockedDates()
  } catch (error) {
    console.warn("Schedule page: Failed to fetch blocked dates:", error instanceof Error ? error.message : String(error))
  }
  
  // Convert Postgres Date objects to easily comparable YYYY-MM-DD strings
  const blockedDates = blockedRes.success && blockedRes.blockedDates 
    ? blockedRes.blockedDates.map(b => b.date.toISOString().split('T')[0]) 
    : []

  return (
    <Suspense fallback={
        <div className="container py-36 max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-6">
                    <Skeleton className="h-64 rounded-2xl w-full" />
                    <Skeleton className="h-40 rounded-2xl w-full" />
                </div>
                <div className="lg:col-span-8">
                    <Skeleton className="h-[800px] w-full rounded-2xl" />
                </div>
            </div>
        </div>
    }>
      <ScheduleClient 
        calendarId={calendarConfig.calendarId}
        businessName={calendarConfig.businessName}
        googleCalendarConfig={calendarConfig.googleConfig}
        blockedDates={blockedDates}
      />
    </Suspense>
  )
}
