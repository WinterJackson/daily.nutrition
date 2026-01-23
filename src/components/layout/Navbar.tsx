"use client"

import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

const navLinks = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-[5px] left-[5px] right-[5px] z-50 transition-all duration-300 border border-transparent rounded-xl",
          isScrolled
            ? "bg-white/80 dark:bg-charcoal/80 backdrop-blur-md shadow-lg border-neutral-200 dark:border-white/10"
            : "bg-transparent"
        )}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
               <Image 
                 src="/logo.png" 
                 alt="Daily Nutrition Logo" 
                 width={180} 
                 height={60} 
                 className="h-14 w-auto object-contain"
                 priority
               />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-brand-green relative",
                    pathname === link.href ? "text-brand-green" : "text-charcoal dark:text-gray-300"
                  )}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-0 top-full block h-[2px] w-full bg-brand-green mt-1"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link href="/booking">
                <Button variant="accent" size="sm" className="shadow-lg shadow-orange/20">
                  Book Consultation
                </Button>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-olive dark:text-off-white p-2"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-charcoal border-b border-neutral-200 dark:border-white/10 overflow-hidden shadow-lg"
            >
              <div className="container mx-auto px-4 py-6 space-y-4 flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-charcoal dark:text-gray-200 hover:text-brand-green py-2 border-b border-neutral-100 dark:border-white/5"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="accent" className="w-full mt-4">
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
