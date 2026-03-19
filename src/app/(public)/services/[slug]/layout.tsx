import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Service Details | Edwak Nutrition",
  description: "Learn more about our specialized nutrition services. Get detailed information about what to expect, pricing, and how to book your consultation.",
}

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
