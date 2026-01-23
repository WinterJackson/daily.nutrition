"use client"

import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface ScrollReveal3DProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "left" | "right" 
}

export function ScrollReveal3D({ 
  children, 
  className,
  delay = 0,
  direction = "up"
}: ScrollReveal3DProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 50 : 0, 
      x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
      rotateX: direction === "up" ? -15 : 0,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      rotateX: 0, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
        delay: delay 
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      style={{ perspective: 1000 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
