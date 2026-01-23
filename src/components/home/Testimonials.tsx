"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Card, CardContent } from "@/components/ui/Card"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Diabetes Patient",
    image: "/testimonial-1.jpg",
    rating: 5,
    content: "Working with Edna transformed how I manage my diabetes. Her personalized meal plans made blood sugar control so much easier. I've never felt better!",
  },
  {
    id: 2,
    name: "James K.",
    role: "Cancer Survivor",
    image: "/testimonial-2.jpg",
    rating: 5,
    content: "During my treatment, Edna's nutritional guidance was invaluable. She helped me maintain my strength and manage side effects through proper nutrition.",
  },
  {
    id: 3,
    name: "Mary W.",
    role: "Gut Health Client",
    image: "/testimonial-3.jpg",
    rating: 5,
    content: "After years of digestive issues, the FODMAP guidance I received finally gave me relief. The personalized approach made all the difference.",
  },
]

export function Testimonials() {
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm text-brand-green font-semibold text-xs uppercase tracking-wide mb-4 border border-brand-green/20 shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            Success Stories
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-olive dark:text-off-white mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Real transformations from real people who took control of their health with personalized nutrition.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="h-full bg-white/90 dark:bg-white/5 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-shadow group">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-brand-green/20 mb-4 group-hover:text-brand-green/40 transition-colors" />

                  {/* Content */}
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 text-sm">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-green/20 to-orange/20 flex items-center justify-center overflow-hidden">
                      {testimonial.image.includes(".jpg") ? (
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-olive dark:text-off-white">
                          {testimonial.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-olive dark:text-off-white text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

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
              <p className="text-sm font-semibold text-olive dark:text-off-white">500+ Patients</p>
              <p className="text-xs text-neutral-500">Transformed Lives</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
