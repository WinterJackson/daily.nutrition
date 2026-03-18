"use client"

import { forgotPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await forgotPassword(email)
      
      if (!result.success) {
        setError(result.error || "An error occurred")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white dark:bg-charcoal px-4">
      <Card className="w-full max-w-md bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-orange" />
          </div>
          <CardTitle className="text-2xl font-serif text-olive dark:text-off-white">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                If an account exists for {email}, a password reset link has been sent. Please check your inbox (and spam folder).
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email Address</label>
                <Input
                  type="email"
                  placeholder="admin@edwaknutrition.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  className="bg-white dark:bg-black/20"
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              
              <Button
                type="submit"
                className="w-full bg-orange hover:bg-orange/90 text-white"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              
              <div className="text-center mt-4">
                <Link 
                  href="/admin/login" 
                  className="text-sm text-neutral-500 hover:text-olive hover:underline transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
