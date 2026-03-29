"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { ServiceIcon } from "@/components/ui/ServiceIcon"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"
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
    image?: string | null
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
            No generic advice, just science-backed, personalized strategies.
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
              <Card className="border-brand-green/30 dark:border-brand-green/20 shadow-xl shadow-brand-green/5 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden relative">
                 <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px]">
                    <div className="md:col-span-3 p-8 md:p-12 bg-brand-green/10 flex items-center justify-center md:border-r border-brand-green/10 z-10">
                       <div className="w-20 h-20 rounded-2xl bg-white dark:bg-charcoal text-brand-green flex items-center justify-center shadow-sm">
                          <ServiceIcon name={discoveryService.icon} className="w-10 h-10" />
                       </div>
                    </div>
                    <div className="md:col-span-5 lg:col-span-6 p-8 md:p-12 text-center md:text-left z-10">
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
                    <div className="hidden md:block md:col-span-4 lg:col-span-3 relative bg-neutral-100 dark:bg-white/5">
                       {discoveryService.image ? (
                           <>
                             <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/60 dark:from-white/0 to-transparent dark:from-charcoal/0 z-10" />
                             <Image src={discoveryService.image} alt={discoveryService.title} fill className="object-cover object-center opacity-90" />
                           </>
                       ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-brand-green/20">
                               <ServiceIcon name={discoveryService.icon} className="w-32 h-32 opacity-20" />
                           </div>
                       )}
                    </div>
                 </div>
              </Card>
           </motion.div>
        )}

        {/* Strict CSS grid guarantees exactly the requested column layout per breakpoint */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {gridServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full hover:shadow-xl transition-all border-neutral-200/80 dark:border-white/10 overflow-hidden flex flex-col group bg-white/90 dark:bg-charcoal/90 backdrop-blur-sm">
                 <div className={`h-1 w-full ${service.bgColor.replace('/10', '')} origin-left transform duration-500 group-hover:scale-x-100 scale-x-0`}></div>
                 
                 <CardHeader className="relative p-0 overflow-hidden">
                   {service.image && (
                       <div className="w-full h-40 relative">
                           <Image src={service.image} alt={service.title} fill className="object-cover" />
                           <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-charcoal to-transparent opacity-90"></div>
                       </div>
                   )}
                   <div className={`px-6 pb-2 relative ${!service.image ? 'pt-6' : '-mt-16 z-10'}`}>
                       <div className={`absolute right-4 p-2.5 rounded-xl ${service.bgColor} ${service.color} group-hover:scale-110 transition-transform ${service.image ? 'top-0 shadow-md bg-white dark:bg-charcoal' : 'top-4 opacity-80'}`}>
                          <ServiceIcon name={service.icon} className="w-5 h-5" />
                       </div>
                       <CardTitle className={`text-xl font-serif mb-1 group-hover:text-brand-green transition-colors leading-tight pr-12 ${!service.image ? 'mt-8' : ''}`}>
                          {service.title}
                       </CardTitle>
                   </div>
                 </CardHeader>
                 
                 <CardContent className="flex-grow pt-0">
                    <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                       {service.shortDescription}
                    </CardDescription>
                    
                    <div className="h-px w-full bg-neutral-100 dark:bg-white/5 mb-4"></div>

                    <ul className="space-y-2">
                       {service.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                             <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 transition-colors ${i === 0 ? 'bg-orange' : 'bg-neutral-300 dark:bg-neutral-600 group-hover:bg-brand-green'}`} />
                             {feature}
                          </li>
                       ))}
                    </ul>
                 </CardContent>
                 
                 <CardFooter className="pt-2 pb-4">
                    <Button asChild variant="ghost" className="w-full justify-between hover:bg-transparent hover:text-orange group/btn p-0 h-auto">
                       <Link href={`/services/${service.slug}`}>
                          <span className="text-xs font-semibold uppercase tracking-wider">Learn More</span>
                          <div className="h-7 w-7 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center group-hover/btn:bg-orange group-hover/btn:text-white transition-colors">
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:-rotate-45" />
                          </div>
                       </Link>
                    </Button>
                 </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
