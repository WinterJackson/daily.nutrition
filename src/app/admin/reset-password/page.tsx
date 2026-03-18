"use client"

import { resetPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { ArrowRight, KeyRound } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="text-center text-red-500 text-sm">
        Invalid or missing reset token. Please request a new password reset link.
        <div className="mt-4">
            <Button asChild variant="outline">
                <Link href="/admin/forgot-password">Request New Link</Link>
            </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
    }

    if (password.length < 8) {
        setError("Password must be at least 8 characters")
        setLoading(false)
        return
    }

    try {
      const result = await resetPassword(token, password)
      
      if (!result.success) {
        setError(result.error || "An error occurred")
      } else {
        setSuccess(true)
        setTimeout(() => {
            router.push("/admin/login")
        }, 3000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
        <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
            Password has been successfully reset! All active sessions have been revoked.
            </div>
            <p className="text-sm text-neutral-500">Redirecting to login...</p>
            <Button asChild className="w-full bg-olive text-white hover:bg-olive/90">
                <Link href="/admin/login">
                    Login Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
        </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">New Password</label>
            <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white dark:bg-black/20"
            />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Confirm Password</label>
            <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-white dark:bg-black/20"
            />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        
        <Button
            type="submit"
            className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
            disabled={loading}
        >
            {loading ? "Resetting..." : "Reset Password"}
        </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white dark:bg-charcoal px-4">
      <Card className="w-full max-w-md bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-olive/10 flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6 text-olive" />
          </div>
          <CardTitle className="text-2xl font-serif text-olive dark:text-off-white">Create New Password</CardTitle>
          <CardDescription>Enter your new password below to regain access.</CardDescription>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<div className="text-center text-sm py-4">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
