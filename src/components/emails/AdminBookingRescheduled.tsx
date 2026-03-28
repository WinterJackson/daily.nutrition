import { Button, Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminBookingRescheduledProps {
    branding: EmailBrandingData;
    clientName: string;
    clientEmail?: string;
    serviceName: string;
    referenceCode?: string;
    newDate: string;
    newTime: string;
    dashboardUrl: string;
}

export const AdminBookingRescheduledEmail = ({
    branding,
    clientName,
    clientEmail,
    serviceName,
    referenceCode,
    newDate,
    newTime,
    dashboardUrl
}: AdminBookingRescheduledProps) => {
    return (
        <BrandedEmailLayout
            branding={branding}
            previewText={`Booking Rescheduled: ${clientName} — ${serviceName}`}
            heading="Booking Rescheduled"
        >
            <Section>
                <Text className="text-[14px] leading-[24px] text-black">
                    An existing appointment has been successfully rescheduled.
                </Text>
                
                <Section className="bg-blue-50 p-5 rounded-lg my-4 border border-blue-100">
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Client</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{clientName}</Text>
                    
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Email</Text>
                    <Text className="m-0 mb-3 text-black">
                        <a href={`mailto:${clientEmail}`} className="text-brand underline">{clientEmail}</a>
                    </Text>

                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Service</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{serviceName}</Text>

                    <Text className="m-0 font-bold text-blue-500 uppercase text-xs mb-1 tracking-wider">New Date & Time</Text>
                    <Text className="m-0 mb-3 text-black font-bold">{newDate} at {newTime}</Text>

                    {referenceCode && (
                        <>
                            <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Reference Code</Text>
                            <Text className="m-0 text-lg font-mono font-bold text-brand">{referenceCode}</Text>
                        </>
                    )}
                </Section>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-[#5bc0de] text-white rounded px-5 py-3 text-[12px] font-semibold no-underline text-center"
                        href={dashboardUrl}
                    >
                        View in Admin Dashboard
                    </Button>
                </Section>
            </Section>
        </BrandedEmailLayout>
    );
};

export default AdminBookingRescheduledEmail;
