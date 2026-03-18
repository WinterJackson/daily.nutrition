import { PasswordResetEmail } from "@/components/email/PasswordResetEmail";
import { AdminContactAlertEmail } from "@/components/emails/AdminContactAlertEmail";
import { AdminNewBookingEmail } from "@/components/emails/AdminNewBooking";
import { AdminPasswordChangedEmail } from "@/components/emails/AdminPasswordChanged";
import { BookingCancellationEmail } from "@/components/emails/BookingCancellation";
import { BookingConfirmationEmail } from "@/components/emails/BookingConfirmation";
import { EmailBrandingData } from "@/components/emails/BrandedEmailLayout";
import { InquiryReceivedEmail } from "@/components/emails/InquiryReceived";
import { InquiryReplyEmail } from "@/components/emails/InquiryReplyEmail";
import { UpcomingReminderEmail } from "@/components/emails/UpcomingReminder";
import { prisma } from "@/lib/prisma";
import { render } from "@react-email/render";

export const dynamic = "force-dynamic";

const sampleBranding: EmailBrandingData = {
  logoUrl: null,
  primaryColor: "#556B2F",
  accentColor: "#E87A1E",
  footerText: "Edwak Nutrition, Nairobi, Kenya",
  websiteUrl: "https://edwaknutrition.co.ke",
  supportEmail: "info@edwaknutrition.co.ke",
};

const templates: Record<string, () => React.ReactElement> = {
  "booking-confirmation": () =>
    BookingConfirmationEmail({
      clientName: "Grace Mwangi",
      serviceName: "Personalized Diet Plan",
      date: "March 25, 2026",
      time: "10:00 AM",
      meetLink: "https://meet.google.com/abc-defg-hij",
      referenceCode: "DN-839201",
      sessionType: "virtual",
      branding: sampleBranding,
    }),
  "booking-cancellation": () =>
    BookingCancellationEmail({
      clientName: "Grace Mwangi",
      serviceName: "Personalized Diet Plan",
      date: "March 25, 2026",
      time: "10:00 AM",
      branding: sampleBranding,
      bookingUrl: "https://edwaknutrition.co.ke/booking",
    }),
  "upcoming-reminder": () =>
    UpcomingReminderEmail({
      clientName: "Grace Mwangi",
      serviceName: "Personalized Diet Plan",
      date: "March 25, 2026",
      time: "10:00 AM",
      meetLink: "https://meet.google.com/abc-defg-hij",
      hoursBefore: 1,
      referenceCode: "DN-839201",
      sessionType: "virtual",
      branding: sampleBranding,
    }),
  "admin-new-booking": () =>
    AdminNewBookingEmail({
      clientName: "Grace Mwangi",
      serviceName: "Personalized Diet Plan",
      date: "March 25, 2026",
      time: "10:00 AM",
      bookingUrl: "https://edwaknutrition.co.ke/admin/bookings/DN-839201",
      branding: sampleBranding,
    }),
  "admin-password-changed": () =>
    AdminPasswordChangedEmail({
      date: "March 18, 2026 at 1:45 PM",
      ipAddress: "192.168.88.250",
      branding: sampleBranding,
    }),
  "admin-contact-alert": () =>
    AdminContactAlertEmail({
      name: "John Kamau",
      email: "john@example.com",
      phone: "+254 712 345 678",
      service: "Weight Management",
      message:
        "Hello, I'm interested in your weight management programme. I've been struggling with maintaining a healthy weight and would love to get professional guidance. Could you please share more details about your packages and pricing?\n\nThank you!",
      branding: sampleBranding,
    }),
  "inquiry-received": () =>
    InquiryReceivedEmail({
      clientName: "John Kamau",
      service: "Weight Management",
      branding: sampleBranding,
    }),
  "inquiry-reply": () =>
    InquiryReplyEmail({
      clientName: "John Kamau",
      originalMessage:
        "Hello, I'm interested in your weight management programme. Could you please share more details?",
      replyMessage:
        "Hi John,\n\nThank you for reaching out! We'd love to help you on your weight management journey.\n\nOur Weight Management programme includes an initial assessment, a personalized meal plan, and bi-weekly follow-up consultations. The programme runs for 3 months.\n\nWould you like to book a free 15-minute discovery call to discuss further?\n\nBest regards,\nEdna R.\nEdwak Nutrition",
      branding: sampleBranding,
    }),
  "password-reset": () =>
    PasswordResetEmail({
      resetLink: "https://edwaknutrition.co.ke/admin/reset-password?token=abc123def456",
      userName: "Admin User",
      branding: sampleBranding,
    }),
};

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: selectedTemplate } = await searchParams;
  
  // Try to load real branding from DB
  let branding = sampleBranding;
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      include: { EmailBranding: true },
    });
    if (settings?.EmailBranding) {
      branding = {
        logoUrl: settings.EmailBranding.logoUrl || null,
        primaryColor: settings.EmailBranding.primaryColor || sampleBranding.primaryColor,
        accentColor: settings.EmailBranding.accentColor || sampleBranding.accentColor,
        footerText: settings.EmailBranding.footerText || sampleBranding.footerText,
        websiteUrl: settings.EmailBranding.websiteUrl || sampleBranding.websiteUrl,
        supportEmail: settings.EmailBranding.supportEmail || sampleBranding.supportEmail,
      };
    }
  } catch {
    // Fall back to sample branding
  }

  let renderedHtml = "";
  if (selectedTemplate && templates[selectedTemplate]) {
    try {
      renderedHtml = await render(templates[selectedTemplate]());
    } catch (err) {
      renderedHtml = `<p style="color:red;padding:20px">Error rendering template: ${err}</p>`;
    }
  }

  const templateList = Object.keys(templates);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 280,
          background: "#1f2937",
          color: "white",
          padding: "24px 16px",
          flexShrink: 0,
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#f9fafb" }}>
          📧 Email Templates
        </h2>
        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 24 }}>
          {templateList.length} templates • Click to preview
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {templateList.map((key) => {
            const isActive = selectedTemplate === key;
            return (
              <a
                key={key}
                href={`?template=${key}`}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#ffffff" : "#d1d5db",
                  background: isActive ? "#556B2F" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                {key
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Preview Area */}
      <main style={{ flex: 1, background: "#f3f4f6", padding: 32, overflow: "auto" }}>
        {selectedTemplate && renderedHtml ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
                  {selectedTemplate
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </h1>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                  Preview with {branding.logoUrl ? "live logo" : "fallback circle"} • Brand primary{" "}
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: branding.primaryColor,
                      verticalAlign: "middle",
                      marginLeft: 4,
                    }}
                  />{" "}
                  {branding.primaryColor}
                </p>
              </div>
            </div>
            <div
              style={{
                background: "white",
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden",
                maxWidth: 700,
                margin: "0 auto",
              }}
            >
              <iframe
                srcDoc={renderedHtml}
                style={{
                  width: "100%",
                  height: 800,
                  border: "none",
                }}
                title="Email Preview"
              />
            </div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#9ca3af",
              fontSize: 16,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <p style={{ fontWeight: 600, color: "#374151" }}>Select a template from the sidebar</p>
              <p style={{ fontSize: 13 }}>Click any template name to see a live preview</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
