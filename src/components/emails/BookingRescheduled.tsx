import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface BookingRescheduledProps {
  clientName: string;
  serviceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  referenceCode: string;
  manageUrl: string;
  branding: EmailBrandingData;
}

export const BookingRescheduledEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  oldDate = "October 24, 2026",
  oldTime = "10:00 AM",
  newDate = "October 26, 2026",
  newTime = "2:00 PM",
  referenceCode = "DN-123456",
  manageUrl = "https://edwaknutrition.co.ke/booking/manage",
  branding
}: BookingRescheduledProps) => {
  const previewText = `Booking Rescheduled: ${serviceName} with Edwak Nutrition`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading="Booking Rescheduled"
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        Your appointment for <strong>{serviceName}</strong> has been successfully rescheduled. Here are your updated details:
        </Text>
        
        {/* Old Time — Struck Through */}
        <Section className="bg-red-50 p-4 rounded-lg my-4 border border-red-100">
        <Text className="m-0 text-red-800 font-bold uppercase text-xs mb-2">
            Previous Time (Cancelled)
        </Text>
        <Text className="m-0 text-base text-red-600 line-through">
            {oldDate} at {oldTime}
        </Text>
        </Section>

        {/* New Time — Highlighted */}
        <Section className="bg-green-50 p-6 rounded-lg my-4 border border-green-200">
        <Text className="m-0 text-green-800 font-bold uppercase text-xs mb-2">
            New Appointment
        </Text>
        <Text className="m-0 text-lg font-semibold text-green-900 mb-4">
            {newDate} at {newTime}
        </Text>
        
        <Text className="m-0 text-green-800 font-bold uppercase text-xs mb-2 mt-4">
            Reference Code
        </Text>
        <Text className="m-0 text-lg font-mono font-semibold text-green-900">
            {referenceCode}
        </Text>
        </Section>

        <Text className="text-black text-[14px] leading-[24px]">
            If you need to make further changes, you can manage your booking using the button below.
        </Text>

        <Section className="text-center mt-[32px] mb-[32px]">
        <Button
            className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
            href={manageUrl}
        >
            Manage Booking
        </Button>
        </Section>

        <Text className="text-[#666666] text-[12px] leading-[20px]">
            Please ensure you arrive or join on time. If you need to reschedule again, please do so at least 24 hours before your appointment.
        </Text>
    </BrandedEmailLayout>
  );
};

export default BookingRescheduledEmail;
