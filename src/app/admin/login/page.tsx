"use client"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate auth
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-charcoal flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-6">
              <Image 
                 src="/logo.jpg" 
                 alt="Daily Nutrition" 
                 width={200} 
                 height={80} 
                 className="h-20 w-auto object-contain"
                 priority
               />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Access</CardTitle>
          <CardDescription>Enter your credentials to manage the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="admin@dailynutrition.com" required />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" required />
             </div>
             <Button className="w-full" size="lg" disabled={isLoading} variant="accent">
                {isLoading ? "Authenticating..." : "Sign In"}
             </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
