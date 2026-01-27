"use client"

import { BookingModal } from "@/components/BookingModal"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { TiltCard } from "@/components/ui/TiltCard"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface HeroProps {
  calendlyUrl?: string
}

export function Hero({ calendlyUrl }: HeroProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-off-white dark:bg-charcoal pt-20">
      
      {/* Animated Background */}
      <AnimatedBackground variant="hero" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content Column */}
          <motion.div 
            style={{ opacity }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-brand-green/20 text-olive dark:text-brand-green text-sm font-medium shadow-sm"
            >
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                </span>
               Accepting New Patients
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-olive dark:text-off-white leading-[1.1]">
              Nutrition Care, <br/>
              <span className="text-brand-green">
                Reimagined.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-lg">
              Evidence-based, personalized support for <strong>Cancer</strong>, <strong>Diabetes</strong>, and <strong>Gut Health</strong>. We bring the clinic to you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <BookingModal calendlyUrl={calendlyUrl} />
              <Link href="/services">
                <Button size="lg" variant="outline" className="h-12 px-8 border-olive/20 hover:bg-olive/5 text-olive dark:text-off-white dark:border-white/20 dark:hover:bg-white/10">
                  View Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>


            <div className="pt-6 flex items-center gap-6">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-off-white dark:border-charcoal bg-neutral-200 dark:bg-white/10 overflow-hidden">
                             <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-white/10 dark:to-white/5"></div>
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-off-white dark:border-charcoal bg-brand-green text-white flex items-center justify-center font-bold text-xs shadow-lg">
                        500+
                    </div>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Trusted by patients <br className="hidden sm:block"/> worldwide
                </div>
            </div>
          </motion.div>
          
          {/* Visual Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y }}
            className="relative hidden lg:block"
          >
             <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-olive/15 border border-white/50 dark:border-white/10 glow-green">
                  <Image 
                    src="/hero-image.png" 
                    alt="Modern Nutrition Consultation" 
                    fill 
                    className="object-cover hover:scale-105 transition-transform duration-[2s]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
             </div>

             {/* Floating Card 1 */}
             <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-16 -left-8 z-20"
             >
                <TiltCard className="bg-white/95 dark:bg-charcoal/95 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-neutral-100 dark:border-white/10 max-w-[200px]" intensity={30}>
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange/10 flex items-center justify-center text-xl shrink-0">
                            🥑
                        </div>
                        <div>
                            <p className="font-semibold text-olive dark:text-off-white text-sm mb-0.5">Custom Plans</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Tailored to your needs</p>
                        </div>
                    </div>
                </TiltCard>
             </motion.div>

             {/* Floating Card 2 */}
             <motion.div 
               animate={{ y: [0, 15, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-24 -right-6 z-20"
             >
                <TiltCard className="bg-white/95 dark:bg-charcoal/95 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-neutral-100 dark:border-white/10 max-w-[200px]" intensity={30}>
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-brand-green/10 flex items-center justify-center text-xl shrink-0">
                            📈
                        </div>
                        <div>
                            <p className="font-semibold text-olive dark:text-off-white text-sm mb-0.5">Track Progress</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Monitor improvements</p>
                        </div>
                    </div>
                </TiltCard>
             </motion.div>
          </motion.div>
        
        </div>
      </div>
    </section>
  )
}
