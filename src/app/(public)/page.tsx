import { getCalendlyUrl } from "@/app/actions/calendly"
import { getServices } from "@/app/actions/services"
import { Hero } from "@/components/home/Hero"
import { HomeCTA } from "@/components/home/HomeCTA"
import { MissionStatement } from "@/components/home/MissionStatement"
import { ServicesOverview } from "@/components/home/ServicesOverview"
import { Testimonials } from "@/components/home/Testimonials"

export default async function Home() {
  const [services, calendlyUrl] = await Promise.all([
    getServices(),
    getCalendlyUrl()
  ])

  return (
    <>
      <Hero calendlyUrl={calendlyUrl} />
      <ServicesOverview services={services} />
      <MissionStatement />
      <Testimonials />
      <HomeCTA />
    </>
  )
}
