"use server";

import { PasswordResetEmail } from "@/components/email/PasswordResetEmail";
import {
    createSession,
    destroySession,
    hashPassword,
    verifyPassword,
    verifySession,
} from "@/lib/auth";
import { sendReactEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { authLimiter } from "@/lib/rate-limit";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

// ═══════════════════════════════════════════════════════
// Login Action (Rate-Limited via centralized authLimiter)
// ═══════════════════════════════════════════════════════

export async function loginAction(
    email: string,
    password: string,
    rememberMe: boolean = false,
): Promise<{ success: boolean; error?: string; requires2FA?: boolean }> {
    try {
        if (!email || !password) {
            return { success: false, error: "Email and password are required" };
        }

        // Rate limit by email + IP for defense in depth
        const headerStore = await headers();
        const ip =
            headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "unknown";

        const cleanEmail = email.trim().toLowerCase();
        const emailCheck = await authLimiter(cleanEmail);
        const ipCheck = await authLimiter(`ip:${ip}`);

        if (!emailCheck.success || !ipCheck.success) {
            return {
                success: false,
                error: "Too many login attempts. Please wait a minute.",
            };
        }

        const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (!user || !user.password) {
            // Generic error to prevent email enumeration
            return { success: false, error: "Invalid credentials" };
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return { success: false, error: "Invalid credentials" };
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            await createSession(user.id, false, rememberMe);
            return { success: true, requires2FA: true };
        }

        // No 2FA — create fully verified session
        await createSession(user.id, true, rememberMe);
        return { success: true };
    } catch (error) {
        // Log actual error in development for diagnostics; keep generic message for security
        const message = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV === "development") {
            console.error("[AUTH] Login error details:", message);
        } else {
            console.error("[AUTH] Login failed (production)");
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

// ═══════════════════════════════════════════════════════
// Logout Action
// ═══════════════════════════════════════════════════════

export async function logoutAction(): Promise<void> {
    await destroySession();
    redirect("/admin/login");
}

// ═══════════════════════════════════════════════════════
// Forgot Password Flow
// ═══════════════════════════════════════════════════════

export async function forgotPassword(email: string) {
    if (!email) return { success: false, error: "Email is required" };

    const cleanEmail = email.trim().toLowerCase();
    const emailCheck = await authLimiter(cleanEmail);
    if (!emailCheck.success) {
        return { success: false, error: "Too many requests. Please wait." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        // Silent success to prevent email enumeration
        if (!user) {
            return { success: true };
        }

        // Generate 32-byte secure crypto token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

        // Delete old unused tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { email: user.email },
        });

        // Save new token
        await prisma.passwordResetToken.create({
            data: {
                email: user.email,
                token,
                expiresAt,
            },
        });

        // Generate reset link
        const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${host}/admin/reset-password?token=${token}`;

        // Dispatch React Email
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            include: { EmailBranding: true },
        });

        await sendReactEmail(
            [user.email],
            "Password Reset Request",
            PasswordResetEmail({
                resetLink,
                userName: user.name || "Admin",
                branding: {
                    logoUrl: settings?.EmailBranding?.logoUrl || null,
                    primaryColor:
                        settings?.EmailBranding?.primaryColor || "#556B2F",
                    accentColor:
                        settings?.EmailBranding?.accentColor || "#E87A1E",
                    footerText:
                        settings?.EmailBranding?.footerText ||
                        "Edwak Nutrition",
                    websiteUrl:
                        settings?.EmailBranding?.websiteUrl ||
                        "https://edwaknutrition.co.ke",
                    supportEmail:
                        settings?.EmailBranding?.supportEmail ||
                        "info@edwaknutrition.co.ke",
                    clinicLocation: settings?.address,
                    contactPhone: settings?.phoneNumber,
                    paymentTill: settings?.paymentTillNumber,
                    paymentPaybill: settings?.paymentPaybill,
                    paymentAccountNumber: settings?.paymentAccountNumber,
                },
            }),
        );

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV === "development") {
            console.error("[AUTH] Forgot password error details:", message);
        } else {
            console.error("[AUTH] Forgot password failed (production)");
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

// ═══════════════════════════════════════════════════════
// Reset Password Flow
// ═══════════════════════════════════════════════════════

export async function resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword)
        return { success: false, error: "Invalid request" };
    if (newPassword.length < 8)
        return {
            success: false,
            error: "Password must be at least 8 characters",
        };

    const headerStore = await headers();
    const ip =
        headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const ipCheck = await authLimiter(`reset:${ip}`);
    if (!ipCheck.success) {
        return { success: false, error: "Too many attempts. Please wait." };
    }

    try {
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            return { success: false, error: "Invalid or expired token" };
        }

        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
        });
        if (!user) return { success: false, error: "User not found" };

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // CRITICAL SECURITY STEP: Invalidate all active sessions across all devices
        await prisma.session.deleteMany({
            where: { userId: user.id },
        });

        // Clean up token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV === "development") {
            console.error("[AUTH] Reset password error details:", message);
        } else {
            console.error("[AUTH] Reset password failed (production)");
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

// ═══════════════════════════════════════════════════════
// Logged-in Session Management & Password Changes
// ═══════════════════════════════════════════════════════

export async function getActiveSessions() {
    const activeSession = await verifySession();
    if (!activeSession) return [];

    const sessions = await prisma.session.findMany({
        where: { userId: activeSession.user.id },
        orderBy: { createdAt: "desc" },
    });

    return sessions.map((s) => ({
        id: s.id,
        isCurrent: s.id === activeSession.session.id,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
    }));
}

export async function revokeSession(sessionId: string) {
    const activeSession = await verifySession();
    if (!activeSession) return { success: false, error: "Unauthorized" };

    try {
        await prisma.session.deleteMany({
            where: { id: sessionId, userId: activeSession.user.id },
        });
        revalidatePath("/admin/settings");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to revoke session" };
    }
}

export async function revokeAllOtherSessions() {
    const activeSession = await verifySession();
    if (!activeSession) return { success: false, error: "Unauthorized" };

    try {
        await prisma.session.deleteMany({
            where: {
                userId: activeSession.user.id,
                id: { not: activeSession.session.id }, // Keep current session
            },
        });
        revalidatePath("/admin/settings");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to revoke sessions" };
    }
}

// ═══════════════════════════════════════════════════════
// Two-Factor Authentication (TOTP)
// ═══════════════════════════════════════════════════════

export async function generate2FASecret() {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized" };

    // Generate a new TOTP secret (32 base32 characters)
    const secret = new OTPAuth.Secret({ size: 20 });
    const secretBase32 = secret.base32;

    // Create a new TOTP object
    const totp = new OTPAuth.TOTP({
        issuer: "Edwak Nutrition",
        label: session.user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
    });

    // Generate URI and QR Code
    const uri = totp.toString();
    const qrCodeUrl = await QRCode.toDataURL(uri);

    return {
        success: true,
        secret: secretBase32,
        qrCodeUrl,
    };
}

export async function verify2FASetup(secret: string, code: string) {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized" };

    const totp = new OTPAuth.TOTP({
        issuer: "Edwak Nutrition",
        label: session.user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
    });

    // Validate the supplied code
    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
        return { success: false, error: "Invalid code. Please try again." };
    }

    // Success - enable 2FA for the user
    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
        },
    });

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function disable2FA() {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized" };

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
        },
    });

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function verify2FALogin(email: string, code: string) {
    // Note: We don't use verifySession here, because their verifySession
    // might fail early if twoFactorVerified is strictly required in the middleware.
    // Instead, we find the pending session based on the user's email
    // and the session cookie, then upgrade it.

    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return { success: false, error: "Session expired" };

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { sessions: { where: { token } } }, // Find the exact session matching their token
    });

    if (!user || user.sessions.length === 0) {
        return { success: false, error: "Invalid session" };
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return { success: false, error: "2FA is not set up on this account" };
    }

    const totp = new OTPAuth.TOTP({
        issuer: "Edwak Nutrition",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
        return { success: false, error: "Invalid authenticator code" };
    }

    // Valid code -> Upgrade the session to fully verified
    const pendingSession = user.sessions[0];
    await prisma.session.update({
        where: { id: pendingSession.id },
        data: { twoFactorVerified: true },
    });

    return { success: true };
}
