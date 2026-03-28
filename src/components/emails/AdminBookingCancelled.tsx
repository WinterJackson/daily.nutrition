import { Button, Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminBookingCancelledProps {
    branding: EmailBrandingData;
    clientName: string;
    clientEmail?: string;
    serviceName: string;
    referenceCode?: string;
    dashboardUrl: string;
}

export const AdminBookingCancelledEmail = ({
    branding,
    clientName,
    clientEmail,
    serviceName,
    referenceCode,
    dashboardUrl
}: AdminBookingCancelledProps) => {
    return (
        <BrandedEmailLayout
            branding={branding}
            previewText={`Booking Cancelled: ${clientName} — ${serviceName}`}
            heading="Booking Cancelled"
        >
            <Section>
                <Text className="text-[14px] leading-[24px] text-black">
                    An existing appointment has been cancelled by the client.
                </Text>
                
                <Section className="bg-red-50 p-5 rounded-lg my-4 border border-red-100">
                    <Text className="m-0 font-bold text-red-500 uppercase text-xs mb-1 tracking-wider">Status</Text>
                    <Text className="m-0 mb-3 text-red-700 font-semibold">CANCELLED</Text>

                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Client</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{clientName}</Text>
                    
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Email</Text>
                    <Text className="m-0 mb-3 text-black">
                        <a href={`mailto:${clientEmail}`} className="text-brand underline">{clientEmail}</a>
                    </Text>

                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Service</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{serviceName}</Text>

                    {referenceCode && (
                        <>
                            <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Reference Code</Text>
                            <Text className="m-0 text-lg font-mono font-bold text-brand">{referenceCode}</Text>
                        </>
                    )}
                </Section>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-[#d9534f] text-white rounded px-5 py-3 text-[12px] font-semibold no-underline text-center"
                        href={dashboardUrl}
                    >
                        View in Admin Dashboard
                    </Button>
                </Section>
            </Section>
        </BrandedEmailLayout>
    );
};

export default AdminBookingCancelledEmail;
