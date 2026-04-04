"use client"

import { deleteStaffMember, getStaffAndInvitations, inviteStaffMember, revokeInvitation } from "@/app/actions/staff"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, Clock, Loader2, Mail, Shield, Trash2, UserPlus, Users } from "lucide-react"
import { useEffect, useState } from "react"

export function StaffManagement() {
    const [users, setUsers] = useState<any[]>([])
    const [invitations, setInvitations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    // Invite Dialog State
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteName, setInviteName] = useState("")
    const [inviteRole, setInviteRole] = useState("ADMIN")
    const [isInviting, setIsInviting] = useState(false)
    const [inviteError, setInviteError] = useState<string | null>(null)

    // Revoke state
    const [isRevoking, setIsRevoking] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        const res = await getStaffAndInvitations()
        if (res.success) {
            setUsers(res.users || [])
            setInvitations(res.invitations || [])
        }
        setIsLoading(false)
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setInviteError(null)
        setIsInviting(true)

        const res = await inviteStaffMember(inviteEmail, inviteName, inviteRole)
        
        setIsInviting(false)
        if (res.success) {
            setIsInviteOpen(false)
            setInviteEmail("")
            setInviteName("")
            setInviteRole("ADMIN")
            loadData()
        } else {
            setInviteError(res.error || "Failed to send invitation")
        }
    }

    const handleRevokeInvite = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this invitation? The link will become invalid.")) return
        setIsRevoking(id)
        await revokeInvitation(id)
        await loadData()
        setIsRevoking(null)
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you absolutely sure you want to delete this user? This will instantly log them out and remove their access.")) return
        setIsDeleting(id)
        const res = await deleteStaffMember(id)
        if (!res.success) {
            alert(res.error)
        } else {
            await loadData()
        }
        setIsDeleting(null)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold font-serif text-olive dark:text-off-white">Staff Management</h3>
                    <p className="text-sm text-caption mt-1">
                        Securely provision role-based access. Passwords are set privately by the invitee.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsInviteOpen(true)}
                    className="surface-elevated text-body border border-default shadow-sm hover:surface-secondary transition-all"
                >
                    <UserPlus className="w-4 h-4 mr-2 text-brand-green" />
                    Invite Staff
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
                </div>
            ) : (
                <>
                    {/* Active Users Table */}
                    <Card className="surface-card overflow-hidden">
                        <div className="p-4 border-b border-default bg-neutral-50/50 dark:bg-white/[0.02]">
                            <h4 className="font-bold flex items-center gap-2 text-body text-sm uppercase tracking-wider">
                                <Users className="w-4 h-4 text-brand-green" />
                                Active Staff
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-caption uppercase surface-secondary">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                        <th className="px-6 py-4 font-semibold">Security</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-subtle last:border-0 hover:surface-secondary transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-body">{user.name || "Unnamed Staff"}</div>
                                                <div className="text-caption text-xs mt-0.5">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    user.role === 'SUPER_ADMIN' 
                                                        ? 'bg-orange/10 text-orange border border-orange/20' 
                                                        : 'surface-elevated text-body border border-default'
                                                }`}>
                                                    {user.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.twoFactorEnabled ? (
                                                     <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
                                                        <CheckCircle className="w-3.5 h-3.5" /> 2FA Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-caption">
                                                        No 2FA
                                                    </span>
                                                )}
                                                {user.lastActiveAt && (
                                                    <div className="text-[10px] text-label mt-1">
                                                        Active {formatDistanceToNow(new Date(user.lastActiveAt))} ago
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={isDeleting === user.id}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                >
                                                    {isDeleting === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pending Invitations Table */}
                    {invitations.length > 0 && (
                        <Card className="surface-card overflow-hidden mt-8 border-dashed">
                            <div className="p-4 border-b border-default bg-neutral-50/50 dark:bg-white/[0.02]">
                                <h4 className="font-bold flex items-center gap-2 text-body text-sm uppercase tracking-wider">
                                    <Clock className="w-4 h-4 text-orange" />
                                    Pending Invitations
                                </h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-caption uppercase surface-secondary">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Invitee</th>
                                            <th className="px-6 py-4 font-semibold">Assigned Role</th>
                                            <th className="px-6 py-4 font-semibold">Expires</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invitations.map((invite) => (
                                            <tr key={invite.id} className="border-b border-subtle last:border-0 hover:surface-secondary transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-body">{invite.name || "Unnamed"}</div>
                                                    <div className="text-caption text-xs mt-0.5 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {invite.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider surface-elevated text-body border border-default">
                                                        {invite.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-medium ${new Date(invite.expiresAt) < new Date() ? 'text-red-500' : 'text-orange'}`}>
                                                        {new Date(invite.expiresAt) < new Date() ? "Expired" : "In " + formatDistanceToNow(new Date(invite.expiresAt))}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleRevokeInvite(invite.id)}
                                                        disabled={isRevoking === invite.id}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    >
                                                        {isRevoking === invite.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        Revoke
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}

            {/* Invite Modal */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Staff Member</DialogTitle>
                        <DialogDescription>
                            They will receive an email linking them to a secure setup page to set their password.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleInvite} className="space-y-4 py-4">
                        {inviteError && (
                            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 text-sm p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                                {inviteError}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-charcoal dark:text-neutral-300">
                                Full Name
                            </label>
                            <Input 
                                required
                                placeholder="Jane Doe"
                                value={inviteName}
                                onChange={e => setInviteName(e.target.value)}
                                className="surface-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-charcoal dark:text-neutral-300">
                                Work Email
                            </label>
                            <Input 
                                required
                                type="email"
                                placeholder="jane@edwaknutrition.co.ke"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                className="surface-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-charcoal dark:text-neutral-300">
                                Role
                            </label>
                            <select 
                                value={inviteRole} 
                                onChange={e => setInviteRole(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#1C1C1E] dark:text-white"
                            >
                                <option value="ADMIN">ADMIN (Standard Access)</option>
                                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Access)</option>
                            </select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)} disabled={isInviting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isInviting} className="surface-elevated text-body border border-default hover:surface-secondary">
                                {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                                Send Invite
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
