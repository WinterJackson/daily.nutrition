"use client"

import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { Calendar } from "lucide-react"
import Link from "next/link"

export function HomeCTA() {
  return (
    <section className="py-24 bg-olive text-off-white relative overflow-hidden border-b-2 border-white/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-brand-green/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-1/4 -left-1/4 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-orange/15 blur-3xl"
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6"
        >
          Ready to Take Control of Your Health?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
        >
          Start your personalized nutrition journey today. Whether virtual or in-person, we are here to support you every step of the way.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/booking">
            <Button size="lg" variant="accent" className="h-14 px-8 text-lg w-full sm:w-auto shadow-2xl shadow-black/20 hover:scale-105 transition-transform">
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Consultation
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
              View Packages & Pricing
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
