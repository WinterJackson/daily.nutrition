"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { ServiceIcon } from "@/components/ui/ServiceIcon"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

interface Service {
    id: string
    title: string
    slug: string
    icon: string
    shortDescription: string
    fullDescription: string | null
    features: string[]
    targetAudience: string | null
    color: string
    bgColor: string
}

export function ServicesOverview({ services }: { services: Service[] }) {
  const discoveryService = services.find(s => s.id === "discovery-call")
  const gridServices = services.filter(s => s.id !== "discovery-call")

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

        {/* Featured Service (Discovery Call) */}
        {discoveryService && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             whileHover={{ y: -5 }}
             transition={{ duration: 0.5 }}
             className="mb-16 max-w-5xl mx-auto"
           >
              <Card className="border-brand-green/30 dark:border-brand-green/20 shadow-xl shadow-brand-green/5 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden">
                 <div className="flex flex-col md:flex-row items-center">
                    <div className="p-8 md:p-12 flex-shrink-0 bg-brand-green/10 md:h-full flex items-center justify-center min-h-[200px] md:min-h-0 w-full md:w-auto md:border-r border-brand-green/10">
                       <div className="w-20 h-20 rounded-2xl bg-white dark:bg-charcoal text-brand-green flex items-center justify-center shadow-sm">
                          <ServiceIcon name={discoveryService.icon} className="w-10 h-10" />
                       </div>
                    </div>
                    <div className="flex-grow p-8 md:p-12 text-center md:text-left">
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-wider mb-4">
                          <Sparkles className="w-3 h-3" />
                          Most Popular
                       </div>
                       <h3 className="text-2xl md:text-3xl font-serif font-bold text-olive dark:text-off-white mb-4">
                          {discoveryService.title}
                       </h3>
                       <p className="text-neutral-600 dark:text-neutral-300 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
                          {discoveryService.fullDescription}
                       </p>
                       <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                          <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold px-8 h-12 rounded-full shadow-lg shadow-brand-green/20">
                             <Link href={`/booking?service=${discoveryService.slug}`}>
                                Book Now - Free
                             </Link>
                          </Button>
                          <Button asChild variant="ghost" className="text-olive dark:text-off-white hover:bg-olive/5 dark:hover:bg-white/10">
                             <Link href={`/services/${discoveryService.slug}`} className="flex items-center gap-2">
                                Learn more <ArrowRight className="w-4 h-4" />
                             </Link>
                          </Button>
                       </div>
                    </div>
                 </div>
              </Card>
           </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gridServices.map((service, index) => (
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
                    <ServiceIcon name={service.icon} className="w-6 h-6" />
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
