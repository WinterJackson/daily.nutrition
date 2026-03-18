import { Card, CardContent } from "@/components/ui/Card"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, ChevronDown } from "lucide-react"
import { useState } from "react"

interface CollapsibleCardProps {
    title: string
    description: string
    icon: React.ElementType
    isOpen?: boolean
    children: React.ReactNode
    onToggle?: () => void
    status?: "active" | "inactive" | "pending"
    className?: string
    headerClassName?: string
    noSwitch?: boolean
}

export function CollapsibleCard({ 
    title, 
    description, 
    icon: Icon, 
    isOpen = false, 
    children, 
    onToggle,
    status = "inactive",
    className = "",
    headerClassName = "",
    noSwitch = false
}: CollapsibleCardProps) {
    const [isInternalOpen, setIsInternalOpen] = useState(isOpen)
    const open = onToggle ? isOpen : isInternalOpen
    const toggle = onToggle || (() => setIsInternalOpen(!isInternalOpen))

    return (
        <Card className={`border-none shadow-xl shadow-neutral-200/50 dark:shadow-black/20 bg-white/90 dark:bg-white/5 backdrop-blur-md overflow-hidden ${className}`}>
            {/* Header */}
            <div 
                onClick={toggle}
                className={`p-6 text-white relative overflow-hidden cursor-pointer transition-colors ${headerClassName || 'bg-olive hover:bg-olive/90'}`}
                role="button"
                tabIndex={0}
            >
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
                                {status === "active" && (
                                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md border border-white/10">
                                        <CheckCircle className="w-3 h-3" />
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-sm font-medium">{description}</p>
                        </div>
                    </div>
                    
                    <div className={`p-2 rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <CardContent className="p-6">
                            {children}
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
