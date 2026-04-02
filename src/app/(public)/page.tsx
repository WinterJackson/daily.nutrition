import { getServices } from "@/app/actions/services"
import { Hero } from "@/components/home/Hero"
import { HomeCTA } from "@/components/home/HomeCTA"
import { MissionStatement } from "@/components/home/MissionStatement"
import { ServicesOverview } from "@/components/home/ServicesOverview"
import { Testimonials } from "@/components/home/Testimonials"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edwak Nutrition | Professional Nutrition Consultancy in Nairobi",
  description: "Expert nutrition care for cancer, diabetes, gut health, and weight management. Book virtual or in-person consultations with a registered dietitian in Nairobi, Kenya.",
  keywords: ["nutrition consultancy", "dietitian Nairobi", "cancer nutrition", "diabetes diet", "gut health", "weight management", "virtual nutrition consultation"],
  openGraph: {
    title: "Edwak Nutrition | Professional Nutrition Consultancy",
    description: "Expert nutrition care for cancer, diabetes, gut health, and weight management. Book virtual or in-person consultations.",
    type: "website",
    locale: "en_KE",
    siteName: "Edwak Nutrition",
  },
}

export default async function Home() {
  let services: any[] = []
  try {
    services = await getServices()
  } catch {
    // Database unavailable — render without services
  }

  return (
    <>
      <Hero />
      <ServicesOverview services={services} />
      <MissionStatement />
      <Testimonials />
      <HomeCTA />
    </>
  )
}
