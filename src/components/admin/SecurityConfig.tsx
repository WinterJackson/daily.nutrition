import { disable2FA, generate2FASecret, verify2FASetup } from "@/app/actions/auth"
import { updatePassword } from "@/app/actions/settings"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { KeyRound, Loader2, QrCode, Save, ShieldAlert, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { CollapsibleCard } from "./CollapsibleCard"

interface SecurityConfigProps {
    isOpen: boolean
    onToggle: () => void
    is2FAEnabled: boolean
}

export function SecurityConfig({ isOpen, onToggle, is2FAEnabled }: SecurityConfigProps) {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    // 2FA State
    const [setup2FA, setSetup2FA] = useState<{ secret: string; qrCodeUrl: string } | null>(null)
    const [verifyCode, setVerifyCode] = useState("")
    const [is2FASaving, setIs2FASaving] = useState(false)
    const [tfaError, setTfaError] = useState("")
    const [tfaSuccess, setTfaSuccess] = useState("")

    const handlePasswordSave = async () => {
        setError("")
        setSuccess(false)

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match")
            return
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setIsSaving(true)
        try {
            const res = await updatePassword({ currentPassword, newPassword })
            if (res.success) {
                setSuccess(true)
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setTimeout(() => setSuccess(false), 3000)
            } else {
                setError(res.error || "Failed to update password")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    const handleStart2FA = async () => {
        setIs2FASaving(true)
        setTfaError("")
        try {
            const res = await generate2FASecret()
            if (res.success && res.qrCodeUrl && res.secret) {
                setSetup2FA({ secret: res.secret, qrCodeUrl: res.qrCodeUrl })
            } else {
                setTfaError(res.error || "Failed to generate 2FA setup")
            }
        } catch (err) {
            setTfaError("Unexpected error starting 2FA setup")
        } finally {
            setIs2FASaving(false)
        }
    }

    const handleVerify2FA = async () => {
        if (!setup2FA || !verifyCode) return
        setIs2FASaving(true)
        setTfaError("")
        try {
            const res = await verify2FASetup(setup2FA.secret, verifyCode)
            if (res.success) {
                setTfaSuccess("Two-Factor Authentication is now enabled!")
                setSetup2FA(null)
                setVerifyCode("")
                setTimeout(() => setTfaSuccess(""), 4000)
            } else {
                setTfaError(res.error || "Invalid verification code")
            }
        } catch (err) {
            setTfaError("Unexpected error verifying 2FA")
        } finally {
            setIs2FASaving(false)
        }
    }

    const handleDisable2FA = async () => {
        if (!confirm("Are you sure you want to disable 2FA? This makes your account less secure.")) return
        setIs2FASaving(true)
        setTfaError("")
        try {
            const res = await disable2FA()
            if (res.success) {
                setTfaSuccess("Two-Factor Authentication disabled.")
                setTimeout(() => setTfaSuccess(""), 4000)
            } else {
                setTfaError(res.error || "Failed to disable 2FA")
            }
        } catch (err) {
            setTfaError("Unexpected error disabling 2FA")
        } finally {
            setIs2FASaving(false)
        }
    }

    return (
        <CollapsibleCard
            title="Security Settings"
            description="Manage your password and two-factor authentication"
            icon={ShieldCheck}
            isOpen={isOpen}
            onToggle={onToggle}
            status={is2FAEnabled ? "active" : "inactive"}
        >
            <div className="space-y-8">
                {/* 2FA Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 border-b border-subtle pb-2">
                        Two-Factor Authentication (2FA)
                    </h3>
                    
                    {is2FAEnabled ? (
                        <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-brand-green">
                                <ShieldCheck className="w-6 h-6" />
                                <div>
                                    <p className="font-bold">2FA is Enabled</p>
                                    <p className="text-xs opacity-80">Your account is secured with TOTP authentication.</p>
                                </div>
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleDisable2FA}
                                disabled={is2FASaving}
                            >
                                {is2FASaving ? "Disabling..." : "Disable 2FA"}
                            </Button>
                        </div>
                    ) : setup2FA ? (
                        <div className="surface-secondary p-6 rounded-xl border border-default grid md:grid-cols-2 gap-8 items-center animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-4">
                                <h4 className="font-bold text-body">1. Scan the QR Code</h4>
                                <p className="text-sm text-caption">Open your Authenticator app (like Google Authenticator or Authy) and scan this QR code.</p>
                                <div className="bg-white p-2 w-max rounded-xl">
                                    <Image unoptimized src={setup2FA.qrCodeUrl} alt="2FA QR Code" width={150} height={150} />
                                </div>
                                <p className="text-xs text-caption font-mono bg-default p-2 rounded">Secret: {setup2FA.secret}</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-body">2. Verify Token</h4>
                                <p className="text-sm text-caption">Enter the 6-digit code from your app to verify and enable 2FA.</p>
                                <Input 
                                    type="text" 
                                    placeholder="000000" 
                                    className="font-mono text-center tracking-[0.5em] text-lg lg:w-1/2 bg-white dark:bg-black/20"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                    maxLength={6}
                                />
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setSetup2FA(null)}>Cancel</Button>
                                    <Button onClick={handleVerify2FA} disabled={verifyCode.length !== 6 || is2FASaving}>
                                        {is2FASaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enable"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="surface-secondary p-4 rounded-xl border border-default flex items-center justify-between">
                            <div className="flex items-center gap-3 text-caption">
                                <ShieldAlert className="w-6 h-6 text-brand-orange" />
                                <div>
                                    <p className="font-bold text-body">2FA is Disabled</p>
                                    <p className="text-xs">Add an extra layer of security to your admin account.</p>
                                </div>
                            </div>
                            <Button onClick={handleStart2FA} disabled={is2FASaving}>
                                <QrCode className="w-4 h-4 mr-2" />
                                Setup 2FA
                            </Button>
                        </div>
                    )}
                    {tfaError && <p className="text-sm text-red-500 font-medium">{tfaError}</p>}
                    {tfaSuccess && <p className="text-sm text-brand-green font-medium">{tfaSuccess}</p>}
                </div>

                {/* Password Section */}
                <div className="space-y-4 pt-4 border-t border-subtle">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 border-b border-subtle pb-2">
                        Change Password
                    </h3>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                            <KeyRound className="w-3 h-3" /> Current Password
                        </label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-white dark:bg-black/20"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">New Password</label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Confirm New Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-white dark:bg-black/20"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    )}
                    {success && (
                        <p className="text-sm text-brand-green font-medium">Password updated successfully</p>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button 
                            onClick={handlePasswordSave}
                            disabled={isSaving || !currentPassword || !newPassword}
                            variant="accent"
                            className="shadow-lg shadow-orange/20"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </CollapsibleCard>
    )
}
