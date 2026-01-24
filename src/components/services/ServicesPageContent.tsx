"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion"
import { services as allServices, faqs, processSteps } from "@/lib/data"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function ServicesPageContent({ activeServiceIds }: { activeServiceIds: string[] }) {
  const visibleServices = allServices.filter(s => activeServiceIds.includes(s.id))
  
  const discoveryService = visibleServices.find(s => s.id === "discovery-call")
  const gridServices = visibleServices.filter(s => s.id !== "discovery-call")
  
  const isDiscoveryCallActive = activeServiceIds.includes("discovery-call")

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal pt-24 pb-24 relative overflow-hidden">
       
       {/* Animated Background */}
       <AnimatedBackground variant="section" />
       
       {/* Background Image Layer */}
       <div className="absolute inset-0 z-0 opacity-5 dark:opacity-[0.03]">
           <Image 
             src="/services-bg.png" 
             alt="Background" 
             fill 
             className="object-cover"
           />
       </div>

       {/* Header */}
       <section className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm text-olive dark:text-brand-green font-medium text-sm mb-6 border border-olive/10 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Specialized Care
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-serif text-olive dark:text-off-white mb-6"
          >
            Our Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed"
          >
            Comprehensive, evidence-based nutrition programs tailored to your unique health goals.
          </motion.p>
       </section>

       {/* Featured Service (Discovery Call) */}
       {discoveryService && (
          <section className="relative z-10 container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               whileHover={{ y: -5 }}
               transition={{ duration: 0.5 }}
             >
                <Card className="border-brand-green/30 dark:border-brand-green/20 shadow-xl shadow-brand-green/5 bg-white/60 dark:bg-white/5 backdrop-blur-md overflow-hidden">
                   <div className="flex flex-col md:flex-row items-center">
                      <div className="p-8 md:p-12 flex-shrink-0 bg-brand-green/10 md:h-full flex items-center justify-center min-h-[200px] md:min-h-0 w-full md:w-auto md:border-r border-brand-green/10">
                         <div className="w-20 h-20 rounded-2xl bg-white dark:bg-charcoal text-brand-green flex items-center justify-center shadow-sm">
                            <discoveryService.icon className="w-10 h-10" />
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
          </section>
       )}
       
       {/* Grid */}
       <section className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                   
                   <CardHeader className="relative pb-2">
                     <div className={`absolute top-4 right-4 p-2.5 rounded-xl ${service.bgColor} ${service.color} opacity-80 group-hover:scale-110 transition-transform`}>
                        <service.icon className="w-5 h-5" />
                     </div>
                     <CardTitle className="text-xl font-serif mt-8 mb-1 group-hover:text-brand-green transition-colors leading-tight pr-12">
                        {service.title}
                     </CardTitle>
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
       </section>

       {/* Process Timeline Section */}
       <section className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-olive dark:text-off-white mb-4">
              How It Works
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Your journey to better health is simple and structured.
            </p>
          </motion.div>

          <div className="relative">
             {/* Connector Line (Desktop) */}
             <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-neutral-200 dark:bg-white/10 -z-10" />

             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative flex flex-col items-center text-center group"
                  >
                     <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-4 transition-all duration-300 relative bg-white dark:bg-charcoal border-2 z-10 border-brand-green text-brand-green shadow-lg shadow-brand-green/20 group-hover:scale-110">
                        {step.number}
                     </div>
                     
                     <h3 className="text-lg font-serif font-semibold mb-2 text-olive dark:text-off-white">
                        {step.title}
                     </h3>
                     
                     <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px]">
                        {step.description}
                     </p>
                  </motion.div>
                ))}
             </div>
          </div>
       </section>

       {/* FAQ Section */}
       <section className="relative z-10 container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-olive dark:text-off-white mb-4">
              Common Questions
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Everything you need to know before getting started.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 dark:border-white/5"
          >
             <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                   <AccordionItem key={index} value={`item-${index}`} className="border-neutral-200 dark:border-white/10 last:border-0">
                      <AccordionTrigger className="text-left text-olive dark:text-off-white hover:text-brand-green dark:hover:text-brand-green">
                         {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                         {faq.answer}
                      </AccordionContent>
                   </AccordionItem>
                ))}
             </Accordion>
          </motion.div>
       </section>

       {/* CTA Banner - Only show if Discovery Call is active */}
       {isDiscoveryCallActive && (
           <section className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl bg-olive dark:bg-olive/40 px-6 py-16 md:px-16 md:py-20 text-center"
              >
                 {/* Decorative Circles */}
                 <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

                 <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-6">
                       Not sure where to start?
                    </h2>
                    <p className="text-white/80 text-lg mb-8 leading-relaxed">
                       Book a free 15-minute discovery call to discuss your health goals and find out which plan is right for you.
                    </p>
                    <Button asChild size="lg" className="bg-white text-olive hover:bg-neutral-100 dark:hover:bg-neutral-200 font-semibold px-8 py-6 h-auto text-base rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                       <Link href="/booking?service=discovery-call">
                          Book Your Free Discovery Call
                       </Link>
                    </Button>
                 </div>
              </motion.div>
           </section>
       )}
    </div>
  )
}
