import { getBookings, getBookingStats } from "@/app/actions/bookings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Calendar } from "lucide-react"
import { BookingsClient } from "./BookingsClient"

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const filter = (params.filter as "all" | "upcoming" | "past" | "today") || "all"
  
  const [{ bookings }, stats] = await Promise.all([
    getBookings(filter),
    getBookingStats()
  ])

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-olive dark:text-off-white">Bookings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your client appointments and consultations.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-olive dark:text-off-white">{stats.total}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Bookings</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-brand-green">{stats.upcoming}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-orange">{stats.today}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Today</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-soft-green">{stats.completed}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card className="border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-orange" />
            Appointments ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <BookingsClient initialBookings={bookings} />
        </CardContent>
      </Card>
    </div>
  )
}
