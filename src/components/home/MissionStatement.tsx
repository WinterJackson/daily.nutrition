"use client"

import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { ArrowRight, Quote } from "lucide-react"

export function MissionStatement() {
  return (
    <section className="py-24 bg-gradient-to-br from-off-white via-white to-soft-green/5 dark:from-charcoal dark:via-charcoal dark:to-brand-green/5 relative overflow-hidden">
      {/* Animated background elements */}
      {/* Animated background elements */}
      <AnimatedBackground variant="subtle" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Quote Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Quote className="absolute -top-4 -left-4 w-16 h-16 text-brand-green/10 dark:text-brand-green/20" />
            <blockquote className="text-2xl md:text-3xl font-serif text-olive dark:text-off-white leading-relaxed pl-8 border-l-4 border-brand-green">
              "Our mission is to empower individuals with the knowledge and support they need to make lasting, positive changes in their health through evidence-based nutrition."
            </blockquote>
            <cite className="block mt-6 pl-8 text-neutral-500 dark:text-neutral-400 not-italic">
              — Edna N., Founder
            </cite>
          </motion.div>
          
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-neutral-100 dark:border-white/10"
          >
            <h3 className="text-xl font-semibold text-olive dark:text-off-white mb-4">Why Choose Us?</h3>
            <ul className="space-y-4 text-neutral-600 dark:text-neutral-300">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-green mt-2 shrink-0"></span>
                <span>Evidence-based, personalized nutrition plans</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-green mt-2 shrink-0"></span>
                <span>Specialized expertise in chronic conditions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-green mt-2 shrink-0"></span>
                <span>Compassionate, one-on-one support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-green mt-2 shrink-0"></span>
                <span>Virtual and in-person consultations</span>
              </li>
            </ul>
            <Button variant="outline" className="mt-6 border-olive/20 text-olive hover:bg-olive/5 dark:border-white/20 dark:text-off-white dark:hover:bg-white/10">
              Read Our Full Story <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
