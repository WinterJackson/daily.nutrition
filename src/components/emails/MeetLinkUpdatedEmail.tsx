import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface MeetLinkUpdatedProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetLink: string;
  referenceCode?: string;
  sessionType?: "virtual" | "in-person";
  branding: EmailBrandingData;
}

export const MeetLinkUpdatedEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  meetLink = "https://meet.google.com/xxx-xxxx-xxx",
  referenceCode = "DN-123456",
  sessionType = "virtual",
  branding
}: MeetLinkUpdatedProps) => {
  const isVirtual = sessionType === "virtual";
  const previewText = `Update: Meeting Link for ${serviceName}`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Virtual Meeting Link Updated"
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        The meeting room link for your upcoming <strong>{serviceName}</strong> appointment has been updated by the administrator. Please use the new link below to join your session.
        </Text>
        
        <Section className="bg-offwhite p-6 rounded-lg my-6">
        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            When
        </Text>
        <Text className="m-0 text-lg font-semibold mb-4">
            {date} at {time}
        </Text>
        
        <Text className="m-0 text-olive font-bold uppercase text-xs mb-2">
            Where
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
          <Section className="bg-white p-5 rounded-lg border border-blue-200 mt-[32px] text-center">
            <Text className="m-0 text-black font-semibold text-[14px] mb-4">
              Your new, active secure video meeting link is:
            </Text>
            <Button
              className="bg-blue-600 rounded text-white text-[14px] font-semibold no-underline text-center px-6 py-4"
              style={{ backgroundColor: branding.primaryColor || '#556B2F' }}
              href={meetLink}
            >
              Join Virtual Meeting
            </Button>
          </Section>
        )}
        
        <Section className="text-center mt-[32px] mb-[32px]">
          <Button
            className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            style={{ backgroundColor: branding.accentColor || '#E87A1E' }}
            href={`${branding.websiteUrl}/booking/manage/${referenceCode}`}
          >
            Manage Booking
          </Button>
          <Text className="text-gray-500 text-[12px] mt-4">
            If you need to reschedule or cancel, please do so at least 24 hours in advance using the button above.
          </Text>
        </Section>
        
        <Text className="text-black text-[14px] leading-[24px]">
        If you have any further questions, please reply directly to this email.
        </Text>
    </BrandedEmailLayout>
  );
};

export default MeetLinkUpdatedEmail;
