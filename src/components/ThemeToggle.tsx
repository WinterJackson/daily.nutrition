"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/Button"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Sun className={`h-5 w-5 transition-all duration-300 text-olive dark:text-off-white ${isDark ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100"}`} />
      <Moon className={`h-5 w-5 transition-all duration-300 text-olive dark:text-off-white ${isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0 absolute"}`} />
    </Button>
  )
}
