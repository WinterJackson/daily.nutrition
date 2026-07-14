import { Button, Section, Text } from "@react-email/components";
import { BrandedEmailLayout, EmailBrandingData } from "./BrandedEmailLayout";

interface AdminPaymentSubmittedProps {
    branding: EmailBrandingData;
    clientName: string;
    referenceCode: string;
    amount: number | null;
    transactionCode: string;
    dashboardUrl: string;
}

export const AdminPaymentSubmittedEmail = ({
    branding,
    clientName,
    referenceCode,
    amount,
    transactionCode,
    dashboardUrl
}: AdminPaymentSubmittedProps) => {
    return (
        <BrandedEmailLayout
            branding={branding}
            previewText={`Payment Submitted by ${clientName} (${transactionCode})`}
            heading="Payment Submitted for Verification"
        >
            <Section>
                <Text className="text-[14px] leading-[24px] text-black">
                    A client has submitted an M-Pesa transaction code for their pending booking. Please verify the payment in the admin dashboard.
                </Text>
                
                <Section className="bg-blue-50 p-5 rounded-lg my-4 border border-blue-100">
                    <Text className="m-0 font-bold text-blue-800 uppercase text-xs mb-1 tracking-wider">M-Pesa Transaction Code</Text>
                    <Text className="m-0 mb-4 text-2xl font-mono font-bold text-blue-900">{transactionCode}</Text>

                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Client</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">{clientName}</Text>
                    
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Expected Amount</Text>
                    <Text className="m-0 mb-3 text-black font-semibold">
                        {amount != null ? `Ksh ${amount.toLocaleString()}` : "N/A"}
                    </Text>
                    
                    <Text className="m-0 font-bold text-gray-500 uppercase text-xs mb-1 tracking-wider">Reference Code</Text>
                    <Text className="m-0 text-lg font-mono font-bold text-brand">{referenceCode}</Text>
                </Section>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-brand text-white rounded px-5 py-3 text-[12px] font-semibold no-underline text-center"
                        href={dashboardUrl}
                    >
                        Verify Payment Now
                    </Button>
                </Section>
            </Section>
        </BrandedEmailLayout>
    );
};

export default AdminPaymentSubmittedEmail;
