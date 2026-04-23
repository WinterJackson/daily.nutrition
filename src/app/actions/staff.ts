"use server";

import { StaffInviteEmail } from "@/components/email/StaffInviteEmail";
import { hashPassword, verifySession } from "@/lib/auth";
import { sendReactEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

/**
 * Ensures the caller is a SUPER_ADMIN.
 */
async function requireSuperAdmin() {
    const session = await verifySession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only SUPER_ADMIN can perform this action");
    }
    return session.user;
}

// ═══════════════════════════════════════════════════════
// Invite Staff Member
// ═══════════════════════════════════════════════════════
export async function inviteStaffMember(email: string, name: string, role: string) {
    try {
        const inviter = await requireSuperAdmin();
        const cleanEmail = email.trim().toLowerCase();

        // Ensure user doesn't already exist
        const existingUser = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (existingUser) {
            return { success: false, error: "A user with this email already exists." };
        }

        // Generate 32-byte secure crypto token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        // Upsert invitation (replace if existing invite is pending)
        await prisma.staffInvitation.upsert({
            where: { email: cleanEmail },
            update: {
                token,
                expiresAt,
                name,
                role,
            },
            create: {
                email: cleanEmail,
                token,
                expiresAt,
                name,
                role,
            },
        });

        // Generate setup link
        const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const setupLink = `${host}/admin/setup-account?token=${token}`;

        // Get branding settings
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            include: { EmailBranding: true },
        });

        const brandingData = {
            logoUrl: settings?.EmailBranding?.logoUrl || null,
            primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
            accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
            footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition",
            websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
            supportEmail: settings?.EmailBranding?.supportEmail || "info@edwaknutrition.co.ke",
            clinicLocation: settings?.address,
            contactPhone: settings?.phoneNumber,
            paymentTill: settings?.paymentTillNumber,
            paymentPaybill: settings?.paymentPaybill,
            paymentAccountNumber: settings?.paymentAccountNumber,
            paymentAccountName: settings?.paymentAccountName,
        };

        // Send Email
        await sendReactEmail(
            [cleanEmail],
            "Welcome to Edwak Nutrition - Setup your account",
            StaffInviteEmail({
                setupLink,
                userName: name || "Staff Member",
                role,
                inviterName: inviter.name || inviter.email,
                branding: brandingData,
            })
        );

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to invite staff member" };
    }
}

// ═══════════════════════════════════════════════════════
// List Staff and Invitations
// ═══════════════════════════════════════════════════════
export async function getStaffAndInvitations() {
    try {
        await requireSuperAdmin();

        const [users, invitations] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    lastActiveAt: true,
                    twoFactorEnabled: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.staffInvitation.findMany({
                orderBy: { createdAt: "desc" },
            })
        ]);

        return { success: true, users, invitations };
    } catch (error) {
        return { success: false, error: "Unauthorized" };
    }
}

// ═══════════════════════════════════════════════════════
// Revoke Invitation
// ═══════════════════════════════════════════════════════
export async function revokeInvitation(id: string) {
    try {
        await requireSuperAdmin();
        await prisma.staffInvitation.delete({
            where: { id },
        });
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to revoke invitation" };
    }
}

// ═══════════════════════════════════════════════════════
// Complete Account Setup (Public API, no auth required)
// ═══════════════════════════════════════════════════════
export async function completeAccountSetup(token: string, newPassword: string) {
    if (!token || !newPassword) return { success: false, error: "Invalid request" };
    if (newPassword.length < 8) return { success: false, error: "Password must be at least 8 characters" };

    try {
        const invitation = await prisma.staffInvitation.findUnique({
            where: { token },
        });

        if (!invitation) {
            return { success: false, error: "Invalid invitation token" };
        }

        if (invitation.expiresAt < new Date()) {
            return { success: false, error: "This invitation has expired. Please contact an administrator to send a new one." };
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Create the user
        await prisma.user.create({
            data: {
                email: invitation.email,
                name: invitation.name,
                password: hashedPassword,
                role: invitation.role,
            },
        });

        // Delete the invitation
        await prisma.staffInvitation.delete({
            where: { id: invitation.id },
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create account. Email may already be in use." };
    }
}

// ═══════════════════════════════════════════════════════
// Delete/Revoke Staff Member
// ═══════════════════════════════════════════════════════
export async function deleteStaffMember(userId: string) {
    try {
        const caller = await requireSuperAdmin();

        if (caller.id === userId) {
            return { success: false, error: "You cannot delete your own account." };
        }

        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userToDelete) return { success: false, error: "User not found" };

        if (userToDelete.role === "SUPER_ADMIN") {
            // Check if this is the last SUPER_ADMIN
            const superAdminCount = await prisma.user.count({
                where: { role: "SUPER_ADMIN" },
            });
            if (superAdminCount <= 1) {
                return { success: false, error: "Cannot delete the last SUPER_ADMIN account." };
            }
        }

        // Delete user (Prisma cascade will handle sessions)
        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete user" };
    }
}
