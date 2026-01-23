"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { Calendar, CheckCircle2, Quote } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-off-white dark:bg-charcoal overflow-hidden relative">
       
       {/* Animated Background */}
       <AnimatedBackground variant="nutrition" />
       
       <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center mb-24">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6 }}
               className="flex-1 space-y-6"
             >
                <div className="inline-block px-4 py-1.5 rounded-full bg-orange/10 text-orange font-semibold tracking-wide text-xs uppercase">
                  Meet Your Dietitian
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-olive dark:text-off-white leading-tight">
                  Edna N.
                </h1>
                <h2 className="text-xl text-neutral-500 dark:text-neutral-400 font-medium">
                  Registered Dietitian & Nutrition Consultant
                </h2>
                <div className="h-1 w-20 bg-brand-green rounded-full"></div>
                
                <div className="space-y-4 text-base md:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    <p>
                    I specialize in nutritional education and counseling for people diagnosed with chronic conditions such as <strong className="text-olive dark:text-off-white">cancer</strong>, <strong className="text-olive dark:text-off-white">diabetes</strong>, and <strong className="text-olive dark:text-off-white">digestive disorders</strong>.
                    </p>
                    <p>
                    For over 8 years, I have worked closely with people of all ages to provide support, education, and the necessary resources to make long-lasting changes in their eating and overall health.
                    </p>
                </div>
                
                <div className="pt-4">
                  <Link href="/booking">
                    <Button variant="accent" size="lg" className="rounded-full shadow-lg shadow-orange/20">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Session
                    </Button>
                  </Link>
                </div>
             </motion.div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="flex-1 w-full max-w-md relative"
             >
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-olive/10 relative z-10 border border-neutral-200 dark:border-white/10 glow-green">
                   <Image 
                     src="/edna-portrait.png" 
                     alt="Edna N. Portrait" 
                     fill 
                     className="object-cover"
                   />
                </div>
                {/* Decorative animated elements */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-8 -right-8 w-48 h-48 bg-orange/20 rounded-full blur-3xl -z-0"
                />
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -bottom-8 -left-8 w-48 h-48 bg-brand-green/20 rounded-full blur-3xl -z-0"
                />
             </motion.div>
          </div>
          
          {/* Credentials */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-neutral-100 dark:border-white/10 mb-16"
          >
             <h3 className="text-xl font-semibold text-olive dark:text-off-white mb-6">Qualifications & Expertise</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Registered Dietitian (BSc. Nutrition & Dietetics)",
                  "Oncology Nutrition Specialist",
                  "Diabetes Educator Certified",
                  "8+ Years Clinical Experience",
                  "Member, Kenya Nutritionists Association",
                  "Evidence-Based Practice Advocate"
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-green mt-0.5 shrink-0" />
                    <span className="text-neutral-600 dark:text-neutral-300">{item}</span>
                  </motion.div>
                ))}
             </div>
          </motion.div>
          
          {/* Philosophy Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-olive/5 to-soft-green/5 dark:from-white/5 dark:to-white/[0.02] rounded-2xl p-8 md:p-12 relative overflow-hidden"
          >
             <Quote className="absolute top-6 left-6 text-olive/10 dark:text-white/5 w-24 h-24 -z-0" />
             <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-brand-green">My Philosophy</h3>
                <p className="text-2xl md:text-3xl text-olive dark:text-off-white leading-relaxed font-serif">
                  "I realized there is no <span className="text-orange">one-size-fits-all</span> approach when it comes to healthy lifestyle. I work one-on-one with my patients to devise comprehensive nutrition programs tailored specifically to their needs."
                </p>
             </div>
          </motion.section>
          
       </div>
    </div>
  )
}
