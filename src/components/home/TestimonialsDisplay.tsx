"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Card, CardContent } from "@/components/ui/Card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/Carousel"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"

interface Testimonial {
  id: string
  authorName: string
  rating: number
  content: string
  serviceId: string | null
}

interface TestimonialsDisplayProps {
  testimonials: Testimonial[]
}

export function TestimonialsDisplay({ testimonials }: TestimonialsDisplayProps) {  // If no testimonials in DB, show placeholder
  if (testimonials.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-b from-off-white to-soft-green/10 dark:from-charcoal dark:to-charcoal relative overflow-hidden">
        <AnimatedBackground variant="subtle" />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-olive dark:text-off-white mb-4">
            What Our Patients Say
          </h2>
          <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400">
            Success stories coming soon!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gradient-to-b from-off-white to-soft-green/10 dark:from-charcoal dark:to-charcoal relative overflow-hidden">
      <AnimatedBackground variant="subtle" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm text-brand-green font-semibold text-[10px] md:text-xs uppercase tracking-wide mb-4 border border-brand-green/20 shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            Success Stories
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-olive dark:text-off-white mb-4">
            What Our Patients Say
          </h2>
          <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Real transformations from real people who took control of their health with personalized nutrition.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative px-6 md:px-12"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.15, 0.6) }}
                  className="h-full mt-2 mb-6"
                >
                  <Card className="h-full bg-white/90 dark:bg-white/5 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-shadow group flex flex-col">
                    <CardContent className="p-6 flex flex-col flex-1">
                      {/* Quote Icon */}
                      <Quote className="w-8 h-8 text-brand-green/20 mb-4 group-hover:text-brand-green/40 transition-colors" />

                      {/* Content */}
                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 text-sm md:text-base flex-1">
                        &quot;{testimonial.content}&quot;
                      </p>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4 mt-auto">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                        ))}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-white/10 shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-green/20 to-orange/20 flex items-center justify-center overflow-hidden shrink-0">
                          <span className="text-lg font-bold text-olive dark:text-off-white">
                            {testimonial.authorName.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-olive dark:text-off-white text-sm md:text-base truncate">
                            {testimonial.authorName}
                          </p>
                          <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                            Verified Client
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-2 lg:-left-6 top-1/2 -translate-y-1/2 bg-white dark:bg-charcoal text-brand-green border-brand-green hover:bg-brand-green hover:text-white transition-all shadow-md h-12 w-12" />
            <CarouselNext className="absolute -right-2 lg:-right-6 top-1/2 -translate-y-1/2 bg-white dark:bg-charcoal text-brand-green border-brand-green hover:bg-brand-green hover:text-white transition-all shadow-md h-12 w-12" />
          </div>
          {/* Mobile Arrows positioned nicely below */}
          <div className="flex w-full justify-center gap-4 mt-6 md:hidden">
            <CarouselPrevious className="relative inset-0 translate-transform-none bg-white dark:bg-charcoal text-brand-green border-brand-green hover:bg-brand-green hover:text-white transition-all shadow-md h-10 w-10" />
            <CarouselNext className="relative inset-0 translate-transform-none bg-white dark:bg-charcoal text-brand-green border-brand-green hover:bg-brand-green hover:text-white transition-all shadow-md h-10 w-10" />
          </div>
        </Carousel>

        {/* Trust Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-full shadow-sm border border-neutral-100 dark:border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green/30 to-orange/30 border-2 border-white dark:border-charcoal"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm md:text-base font-semibold text-olive dark:text-off-white">1000+ Patients</p>
              <p className="text-[10px] md:text-xs text-neutral-500">Transformed Lives</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
