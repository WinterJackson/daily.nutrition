import { getApprovedTestimonials } from "@/app/actions/testimonials"
import { TestimonialsDisplay } from "./TestimonialsDisplay"

export async function Testimonials() {
  let testimonials: any[] = []
  try {
    testimonials = await getApprovedTestimonials()
  } catch {
    // Database unavailable — render without testimonials
  }
  
  return <TestimonialsDisplay testimonials={testimonials} />
}
