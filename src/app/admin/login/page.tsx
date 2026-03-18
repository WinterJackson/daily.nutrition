"use client"

import { loginAction, verify2FALogin } from "@/app/actions/auth"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/Input"
import { Shield, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false)
  const [totpCode, setTotpCode] = useState("")
  
  const router = useRouter()

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await loginAction(email, password, rememberMe)

      if (!result.success) {
        setError(result.error || "Invalid credentials")
      } else if (result.requires2FA) {
        setRequires2FA(true)
      } else {
        router.push("/admin/blog")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await verify2FALogin(email, totpCode)
      if (result.success) {
        router.push("/admin/blog")
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white dark:bg-charcoal px-4">
      <Card className="w-full max-w-md surface-card shadow-xl overflow-hidden relative">
        <CardHeader className="text-center relative z-10">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mb-3 transition-colors duration-500">
            {requires2FA ? (
               <ShieldCheck className="w-6 h-6 text-brand-green animate-in zoom-in duration-300" />
            ) : (
               <Shield className="w-6 h-6 text-brand-green" />
            )}
          </div>
          <CardTitle className="text-2xl font-serif text-olive dark:text-off-white">
             {requires2FA ? "Two-Factor Auth" : "Admin Login"}
          </CardTitle>
          <CardDescription>
             {requires2FA ? "Enter the 6-digit code from your authenticator app" : "Enter your credentials to access the dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {!requires2FA ? (
             <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-caption">Email</label>
                 <Input
                   type="email"
                   placeholder="admin@edwaknutrition.co.ke"
                   value={email}
                   onChange={(e) => setEmail(e.target.value.trim())}
                   required
                   className="surface-input"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-caption">Password</label>
                 <Input
                   type="password"
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="surface-input"
                 />
               </div>

               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="remember" 
                     checked={rememberMe} 
                     onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                   />
                   <label
                     htmlFor="remember"
                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-caption"
                   >
                     Remember me
                   </label>
                 </div>
                 <Link 
                   href="/admin/forgot-password" 
                   className="text-sm text-olive hover:text-orange hover:underline transition-colors"
                 >
                   Forgot Password?
                 </Link>
               </div>

               {error && <p className="text-sm text-red-500 text-center">{error}</p>}
               <Button
                 type="submit"
                 className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                 disabled={loading || !email || !password}
               >
                 {loading ? "Signing in..." : "Sign In"}
               </Button>
             </form>
          ) : (
             <form onSubmit={handle2FASubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-caption text-center block">Authentication Code</label>
                 <Input
                   type="text"
                   placeholder="000000"
                   value={totpCode}
                   onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                   required
                   autoFocus
                   maxLength={6}
                   className="surface-input text-center text-2xl font-mono tracking-[0.5em] h-14"
                 />
               </div>

               {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
               
               <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                    disabled={loading || totpCode.length !== 6}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-caption"
                    onClick={() => {
                        setRequires2FA(false)
                        setTotpCode("")
                        setError("")
                    }}
                    disabled={loading}
                  >
                    Back to Login
                  </Button>
               </div>
             </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
