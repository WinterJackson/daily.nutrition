import { getApprovedTestimonials } from "@/app/actions/testimonials"
import { TestimonialsDisplay } from "./TestimonialsDisplay"

export async function Testimonials() {
  const testimonials = await getApprovedTestimonials()
  
  return <TestimonialsDisplay testimonials={testimonials} />
}
