import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminUpcomingReminderProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetLink: string;
  referenceCode?: string;
  sessionType?: "virtual" | "in-person";
  timeUntil: "30 Minutes" | "15 Minutes";
  branding: EmailBrandingData;
}

export const AdminUpcomingReminderEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  meetLink = "https://meet.google.com/xxx-xxxx-xxx",
  referenceCode = "DN-123456",
  sessionType = "virtual",
  timeUntil = "30 Minutes",
  branding
}: AdminUpcomingReminderProps) => {
  const isVirtual = sessionType === "virtual";
  const previewText = `Action Required: Appointment in ${timeUntil}`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading={`Upcoming Session in ${timeUntil}`}
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello Admin,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        You have an upcoming appointment with <strong>{clientName}</strong> in exactly <strong>{timeUntil}</strong>. Please ensure you are prepared and ready to join the session.
        </Text>
        
        <Section className="bg-offwhite p-6 rounded-lg my-6">
        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            Client
        </Text>
        <Text className="m-0 text-lg font-semibold mb-4">
            {clientName}
        </Text>
        
        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            Service Let
        </Text>
        <Text className="m-0 text-lg font-semibold mb-4">
            {serviceName}
        </Text>

        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            When
        </Text>
        <Text className="m-0 text-lg font-semibold mb-4">
            {date} at {time}
        </Text>
        
        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            Where format
        </Text>
        <Text className="m-0 text-lg font-semibold">
           {isVirtual ? "Google Meet (Video Call)" : "In-Person"}
        </Text>
        
        {referenceCode && (
            <>
                <Text className="m-0 text-olive font-bold uppercase text-xs mb-2 mt-4">
                    Reference Code
                </Text>
                <Text className="m-0 text-lg font-mono font-semibold">
                    {referenceCode}
                </Text>
            </>
        )}
        </Section>

        {isVirtual && meetLink && (
          <Section className="bg-white p-5 rounded-lg border border-brand-green/20 mt-[32px] mb-[32px] text-center shadow-sm">
            <Text className="m-0 text-black font-semibold text-[14px] mb-4">
              Your meeting link is ready. Click below to join the room:
            </Text>
            <Button
              className="bg-brand rounded text-white text-[16px] font-bold no-underline text-center px-8 py-4"
              style={{ backgroundColor: branding.primaryColor || '#556B2F' }}
              href={meetLink}
            >
              Join Video Session Now
            </Button>
          </Section>
        )}
        
        <Section className="text-center mt-[32px] mb-[32px]">
          <Button
            className="bg-neutral-800 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            href={`${branding.websiteUrl}/admin/bookings`}
          >
            Open Admin Dashboard
          </Button>
        </Section>
        
    </BrandedEmailLayout>
  );
};

export default AdminUpcomingReminderEmail;
