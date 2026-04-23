import { AdminContactAlertEmail } from '@/components/emails/AdminContactAlertEmail';
import { InquiryReceivedEmail } from '@/components/emails/InquiryReceived';
import { logAudit } from '@/lib/audit';
import { getResendClient, sendReactEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/services/notification-service';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);
    const { name, email, phone, service, message } = validatedData;

    // Rate limit by IP address
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const { contactLimiter } = await import("@/lib/rate-limit")
    const rateCheck = await contactLimiter(ip)

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      )
    }

    // PHASE 2: Save inquiry to database FIRST (before email)
    // This ensures data is never lost, even if email fails
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        message: `${service ? `[${service}] ` : ''}${message}`,
        statusString: 'NEW',
        ipAddress: ip,
        userAgent: userAgent
      },
    });

    // Fire off audit log
    logAudit({
      action: "INQUIRY_CREATED",
      entity: "Inquiry",
      entityId: inquiry.id,
      metadata: { service, sourceIp: ip }
    });

    // PHASE 3: Notification Broadcast (The Link)
    // Creates an in-app alert (bell icon) for all Admins that deep-links directly to the new lead.
    await NotificationService.broadcastToRoles({
      roles: ["SUPER_ADMIN", "ADMIN"],
      type: "INFO",
      title: "New Contact Inquiry",
      message: `${name} has sent a new inquiry.`,
      priority: "HIGH",
      link: `/admin/inquiries?filter=NEW`
    }).catch(console.error);

    // PHASE 4: Resend Alert (Redundancy)
    try {
      const { resend, fromEmail } = await getResendClient();

      const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { EmailBranding: true }
      });
      const supportEmail = settings?.EmailBranding?.supportEmail || "info@edwaknutrition.co.ke";

      // Send email to the business
      await sendReactEmail(
        [supportEmail], // Dynamic admin alert email
        `New Inquiry: ${service || 'General'} - ${name}`,
        AdminContactAlertEmail({
          name,
          email,
          phone,
          service,
          message,
          branding: {
            logoUrl: settings?.EmailBranding?.logoUrl || null,
            primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
            accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
            footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition",
            websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
            supportEmail: supportEmail
          }
        })
      );

      // Send confirmation email to the client
      await resend.emails.send({
        from: `Edwak Nutrition <${fromEmail}>`,
        to: [email],
        replyTo: supportEmail, // Dynamic support email routing
        subject: 'Thank you for contacting Edwak Nutrition',
        react: InquiryReceivedEmail({
          clientName: name,
          service,
          branding: {
            logoUrl: settings?.EmailBranding?.logoUrl || null,
            primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
            accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
            footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition",
            websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
            supportEmail: supportEmail
          }
        }),
      });
    } catch (emailError) {
      console.error("Email dispatch failed, but inquiry saved:", emailError);
      // Do NOT return error here, the lead is safely in the DB!
    }

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
