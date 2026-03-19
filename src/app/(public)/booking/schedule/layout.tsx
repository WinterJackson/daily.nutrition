import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Schedule Appointment | Edwak Nutrition",
  description: "Select a date and time for your nutrition consultation. Choose from available slots and book your virtual or in-person appointment.",
}

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
