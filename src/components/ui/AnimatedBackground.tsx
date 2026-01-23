"use client"

import { motion } from "framer-motion"
import { Activity, Apple, Brain, Carrot, Dna, Droplets, Heart, Leaf, Pill, Utensils, Wheat } from "lucide-react"

interface AnimatedBackgroundProps {
  variant?: "hero" | "section" | "subtle" | "nutrition"
  className?: string
}

export function AnimatedBackground({ variant = "subtle", className = "" }: AnimatedBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Base Gradient Layers */}
        <GradientLayers variant={variant} />
        
        {/* Creative Floating Nutrition Elements */}
        <CreativeFloatingElements />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-20" />
    </div>
  )
}

function GradientLayers({ variant }: { variant: string }) {
    if (variant === "hero") {
        return (
            <>
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -right-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-br from-soft-green/20 via-brand-green/15 to-transparent dark:from-brand-green/20 dark:via-brand-green/10 dark:to-transparent blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[40%] -left-[15%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-orange/20 via-gold/15 to-transparent dark:from-orange/15 dark:via-gold/10 dark:to-transparent blur-[100px]"
                />
            </>
        )
    }
    // Default/Section/Nutrition layers
    return (
        <>
             <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.8, 0.6], x: [0, 20, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -left-[5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-br from-brand-green/20 to-transparent dark:from-brand-green/20 dark:to-transparent blur-[80px]"
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5], x: [0, -20, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute top-[30%] -right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-bl from-orange/20 to-transparent dark:from-orange/15 dark:to-transparent blur-[80px]"
            />
        </>
    )
}

function CreativeFloatingElements() {
    // A rich set of nutrition & health icons spread randomly across the view
    const elements = [
        // Top Left Quadrant
        { Icon: Leaf, color: "text-brand-green", top: "10%", left: "5%", size: "w-12 h-12", delay: 0 },
        { Icon: Dna, color: "text-olive", top: "25%", left: "15%", size: "w-10 h-10", delay: 2 },
        { Icon: Apple, color: "text-orange", top: "15%", left: "25%", size: "w-14 h-14", delay: 5 },
        
        // Top Right Quadrant
        { Icon: Heart, color: "text-orange", top: "12%", right: "10%", size: "w-12 h-12", delay: 1 },
        { Icon: Brain, color: "text-gold", top: "28%", right: "20%", size: "w-10 h-10", delay: 3 },
        { Icon: Utensils, color: "text-olive", top: "5%", right: "25%", size: "w-8 h-8", delay: 6 },

        // Center / Mid Areas
        { Icon: Pill, color: "text-brand-green", top: "45%", left: "8%", size: "w-10 h-10", delay: 4 },
        { Icon: Activity, color: "text-gold", top: "50%", right: "5%", size: "w-16 h-16", delay: 2 },
        { Icon: Wheat, color: "text-orange", top: "40%", left: "50%", size: "w-12 h-12", delay: 7 }, // Middle center-ish

        // Bottom Left Quadrant
        { Icon: Carrot, color: "text-orange", bottom: "15%", left: "10%", size: "w-12 h-12", delay: 1 },
        { Icon: Droplets, color: "text-brand-green", bottom: "25%", left: "20%", size: "w-8 h-8", delay: 3 },
        
        // Bottom Right Quadrant
        { Icon: Leaf, color: "text-olive", bottom: "10%", right: "15%", size: "w-14 h-14", delay: 5 },
        { Icon: Apple, color: "text-brand-green", bottom: "30%", right: "8%", size: "w-10 h-10", delay: 4 },
    ]

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {elements.map((el, i) => (
                <FloatingIcon key={i} {...el} />
            ))}
            <OrganicShapes />
        </div>
    )
}

function FloatingIcon({ Icon, color, top, left, right, bottom, size, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
                y: [0, -30, 0],
                rotate: [0, 10, 0],
                rotateY: [0, 180, 0], // Slow 3D rotation
                opacity: [0.2, 0.5, 0.2], // Very subtle
                scale: [1, 1.1, 1]
            }}
            transition={{ 
                duration: 12 + delay, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: delay
            }}
            className={`absolute ${color}`}
            style={{ top, left, right, bottom }}
        >
            <Icon className={`${size} opacity-50 dark:opacity-20 drop-shadow-sm`} strokeWidth={1.5} />
        </motion.div>
    )
}

function OrganicShapes() {
    return (
        <>
             <motion.div
                animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-[35%] w-24 h-24 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] bg-brand-green/10 dark:bg-brand-green/5 backdrop-blur-3xl"
            />
             <motion.div
                animate={{ y: [0, 25, 0], scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[35%] right-[30%] w-32 h-32 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-orange/10 dark:bg-orange/5 backdrop-blur-3xl"
            />
        </>
    )
}
