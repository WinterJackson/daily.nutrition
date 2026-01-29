"use client"

import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface AboutClientProps {
  profileImageUrl: string
}

export function AboutClient({ profileImageUrl }: AboutClientProps) {
  return (
    <>
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
          Registered Dietitian and Nutrition Specialist
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
             src={profileImageUrl} 
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
    </>
  )
}
