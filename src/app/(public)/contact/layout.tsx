import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Edwak Nutrition",
  description: "Get in touch with Edwak Nutrition. Visit us at PMC Parklands, Nairobi or book a virtual consultation. We offer in-person and remote nutrition consultations.",
  openGraph: {
    title: "Contact Edwak Nutrition",
    description: "Reach out for expert nutrition guidance. Located at PMC, Parklands — virtual consultations also available.",
    type: "website",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
