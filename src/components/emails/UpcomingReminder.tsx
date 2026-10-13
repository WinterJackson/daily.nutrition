import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface UpcomingReminderProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetLink: string;
  hoursBefore: number; // 6 or 1
  referenceCode: string;
  sessionType?: "virtual" | "in-person";
  /**
   * Names of accepted insurance providers e.g. ["Cigna", "CIC Insurance"].
   * When provided and sessionType is "in-person", a brief insurance reminder is shown.
   */
  acceptedInsurers?: string[];
  branding: EmailBrandingData;
}

export const UpcomingReminderEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  meetLink = "",
  hoursBefore = 24,
  referenceCode,
  sessionType = "virtual",
  acceptedInsurers,
  branding
}: UpcomingReminderProps) => {
  const isVirtual = sessionType === "virtual";
  const timeFrame = hoursBefore === 1 ? "1 hour" : `${hoursBefore} hours`;
  const showInsuranceNote = !isVirtual && acceptedInsurers && acceptedInsurers.length > 0;
  const previewText = `Reminder: Your appointment is in ${timeFrame}`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Upcoming Appointment"
    >
      <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
      </Text>
      <Text className="text-black text-[14px] leading-[24px]">
        This is a friendly reminder that your appointment for <strong>{serviceName}</strong> is starting in approximately <strong>{timeFrame}</strong>.
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
           {isVirtual ? "Google Meet (Video Call)" : "In-Person — PMC Park Medical Center, Parklands"}
        </Text>
      </Section>

      {/* Insurance reminder — only for in-person visits */}
      {showInsuranceNote && (
        <Section className="bg-offwhite p-5 rounded-lg my-4 border border-[#d4edda]">
          <Text className="m-0 text-olive font-bold uppercase text-[10px] mb-2 tracking-wider">
            🛡️ Insurance Accepted for Today's Visit
          </Text>
          <Text className="m-0 text-[#333] text-[13px] leading-[22px]">
            We accept <strong>{acceptedInsurers!.join(" and ")}</strong> insurance at our partner clinic.
            If you plan to use your insurance cover, please have your membership card ready when you arrive.
          </Text>
        </Section>
      )}

      {isVirtual && meetLink ? (
        <Section className="text-center mt-[32px] mb-[32px]">
          <Button
            className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            href={meetLink}
          >
            Join Meeting
          </Button>
        </Section>
      ) : (
        <Section className="text-center mt-[32px] mb-[32px]">
          <Button
            className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            href={`${branding.websiteUrl}/booking/manage/${referenceCode}`}
          >
            Manage Booking
          </Button>
        </Section>
      )}

      <Text className="text-black text-[14px] leading-[24px]">
        Reference Code: <strong>{referenceCode}</strong>
      </Text>
    </BrandedEmailLayout>
  );
};

export default UpcomingReminderEmail;
