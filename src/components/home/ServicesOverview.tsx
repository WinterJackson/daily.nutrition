"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { services as allServices } from "@/lib/data"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function ServicesOverview({ activeServiceIds }: { activeServiceIds?: string[] }) {
  // If activeServiceIds is provided, filter. Otherwise show all (or handle default).
  const visibleServices = activeServiceIds 
    ? allServices.filter(s => activeServiceIds.includes(s.id))
    : allServices; // or empty? Default to all is safer for now if prop missing.

  return (
    <section className="py-24 bg-white/50 dark:bg-charcoal relative overflow-hidden">
      {/* Subtle background gradient */}
      {/* Animated Background */}
      <AnimatedBackground variant="section" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green font-semibold text-xs uppercase tracking-wide mb-4"
          >
            Our Specialties
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-serif text-olive dark:text-off-white mb-6"
          >
            Specialized Care for Your Unique Needs
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-600 dark:text-neutral-300"
          >
            We focus on complex health conditions where nutrition plays a vital therapeutic role. 
            No generic advice—just science-backed, personalized strategies.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border-neutral-200/80 dark:border-white/10 shadow-md hover:shadow-xl transition-all bg-white/90 dark:bg-white/5 backdrop-blur-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-soft-green/5 dark:to-white/5 rounded-bl-[100px] transition-all group-hover:scale-110"></div>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${service.bgColor} ${service.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <service.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="mb-2 text-xl text-olive dark:text-off-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-6 text-neutral-600 dark:text-neutral-400">
                    {service.shortDescription}
                  </CardDescription>
                  <Button variant="link" className="p-0 h-auto text-brand-green hover:text-orange group-hover:translate-x-1 transition-all">
                    Learn More <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
