"use client"

import { cn } from "@/lib/utils"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import React, { useRef } from "react"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  glareOpacity?: number
  perspective?: number
}

export function TiltCard({ 
  children, 
  className,
  intensity = 15,
  glareOpacity = 0.4,
  perspective = 1000
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 })

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  
  // Smooth rotation spring
  const rotateXSpring = useSpring(rotateX, { stiffness: 100, damping: 20 })
  const rotateYSpring = useSpring(rotateY, { stiffness: 100, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseXPos = e.clientX - rect.left
    const mouseYPos = e.clientY - rect.top

    // Calculate rotation (inverted for natural tilt feel)
    const rX = ((mouseYPos / height) - 0.5) * -intensity * 2
    const rY = ((mouseXPos / width) - 0.5) * intensity * 2

    rotateX.set(rX)
    rotateY.set(rY)
    
    // Update raw mouse positions for glare
    x.set(mouseXPos)
    y.set(mouseYPos)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: perspective,
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
      }}
      className={cn("relative group transform-gpu", className)}
    >
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>

      {/* Glare Effect */}
      <motion.div
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, ${glareOpacity}),
              transparent 80%
            )
          `,
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-50 rounded-xl pointer-events-none mix-blend-overlay"
      />
    </motion.div>
  )
}
