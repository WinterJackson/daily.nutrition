import {
    Button,
    Section,
    Text
} from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface BookingConfirmationProps {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetLink?: string;
  rescheduleLink?: string;
  referenceCode?: string;
  /** Capability token binding this booking to the recipient's email. */
  accessToken?: string;
  sessionType?: "virtual" | "in-person";
  expectedAmount?: number | null;
  isFree?: boolean;
  /** Which payment rail is live. Changes the instructions entirely. */
  paymentMode?: "stk" | "manual";
  /**
   * Names of accepted insurance providers e.g. ["Cigna", "CIC Insurance"].
   * When provided and sessionType is "in-person", a brief insurance note is shown.
   * Leave empty/undefined for virtual-only sessions — insurance does not apply.
   */
  acceptedInsurers?: string[];
  branding: EmailBrandingData;
}

export const BookingConfirmationEmail = ({
  clientName = "Client",
  serviceName = "Consultation",
  date = "October 24, 2026",
  time = "10:00 AM",
  meetLink = "",
  referenceCode = "DN-123456",
  sessionType = "virtual",
  expectedAmount,
  accessToken,
  isFree = false,
  paymentMode = "manual",
  acceptedInsurers,
  branding
}: BookingConfirmationProps) => {
  const isVirtual = sessionType === "virtual";
  const isStk = paymentMode === "stk";
  const showInsuranceNote = !isVirtual && acceptedInsurers && acceptedInsurers.length > 0;
  const previewText = isFree ? `Booking Confirmed: ${serviceName}` : `Action Required: Complete Payment for ${serviceName}`;

  return (
    <BrandedEmailLayout
      branding={branding}
      previewText={previewText}
      heading={isFree ? "Booking Confirmed" : "Action Required: Complete Payment"}
      /* Never show Paybill instructions alongside an STK prompt — a customer who
         follows both pays twice. */
      hidePaymentInstructions={isStk}
    >
        <Text className="text-black text-[14px] leading-[24px]">
        Hello <strong>{clientName}</strong>,
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        Your reservation for <strong>{serviceName}</strong> is currently <strong>{isFree ? "CONFIRMED" : "PENDING"}</strong>.
        {!isFree && (isStk
            ? " To secure this time slot, open the link below and tap Pay with M-Pesa. A payment request appears on your phone — enter your M-Pesa PIN and you are done. There is no code to type back."
            : " To secure this time slot, please complete your M-Pesa payment using the instructions located in the Secure Payment block at the bottom of this email.")}
        </Text>
        <Text className="text-black text-[14px] leading-[24px]">
        {isFree
            ? "Our team will reach out with your Google Meet link or check-in instructions shortly before your session."
            : isStk
              ? "Your payment confirms in seconds, and your Google Meet link or check-in instructions arrive by email straight afterwards."
              : "Once payment is verified by our team, you will receive a final confirmation containing your Google Meet link or check-in instructions."}
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
        
        {referenceCode && (
            <>
                <Text className="m-0 text-olive font-bold uppercase text-xs mb-2 mt-4">
                    Reference Code
                </Text>
                <Text className="m-0 text-lg font-mono font-semibold mb-4">
                    {referenceCode}
                </Text>
            </>
        )}
        
        {expectedAmount != null && (
            <>
                <Text className="m-0 text-olive font-bold uppercase text-xs mb-2 mt-4">
                    Amount to Pay
                </Text>
                <Text className="m-0 text-lg font-semibold text-brand-green">
                    Ksh {expectedAmount.toLocaleString()}
                </Text>
            </>
        )}
        </Section>

        {/* Insurance note — shown only for in-person bookings with active insurers */}
        {showInsuranceNote && (
          <Section className="bg-offwhite p-5 rounded-lg my-4 border border-[#d4edda]">
            <Text className="m-0 text-olive font-bold uppercase text-[10px] mb-2 tracking-wider">
              🛡️ Insurance Accepted
            </Text>
            <Text className="m-0 text-[#333] text-[13px] leading-[22px]">
              For your in-person visit, we accept{" "}
              <strong>{acceptedInsurers!.join(" and ")}</strong> insurance at our partner clinic.
              Clients can pay their insurer directly — no out-of-pocket expense.
              Please verify your outpatient nutrition benefit with your insurer before your appointment.
            </Text>
          </Section>
        )}

        <Section className="text-center mt-[32px] mb-[32px]">
            <Button
              className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={`${branding.websiteUrl}/booking/manage/${referenceCode}${accessToken ? `?t=${accessToken}` : ""}`}
            >
              {isFree ? "Track Booking Status" : "Pay with M-Pesa"}
            </Button>
        </Section>
        
        <Text className="text-black text-[14px] leading-[24px]">
        If you need to cancel this reservation or have any questions, please reply directly to this email. {!isFree && "Unpaid slots will be automatically released."}
        </Text>
    </BrandedEmailLayout>
  );
};

export default BookingConfirmationEmail;
